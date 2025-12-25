/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { authMiddleware } from '#guiho/app/auth/auth-middleware.js'
import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { profileMiddleware } from '#guiho/app/profile/profile-middleware.js'
import { roomAuthorization } from '#guiho/app/room-chat/room-authorization.js'
import { RoomChatSubscriptionManager } from '#guiho/app/room-chat/room-chat-manager.js'
import { roomMessage } from '@guiho40/nante40'
import { Elysia, t } from 'elysia'

export { roomChatService }
export type {}
/**
 * The Input shape coming from the WebSocket client
 */
const incomingMessageSchema = t.Object({
  content: t.String({ minLength: 1, maxLength: 2000 }),
  // In a real app, profileId might come from a session cookie/JWT,
  // but we accept it in body for this example.
  profileId: t.Number(),
})

// --- Service ---

function roomChatService(di: DependencyInjection) {
  /**
   * @section Singleton Manager
   * Since this function is called exactly once, this instance acts as a Singleton.
   */
  const chatManager = new RoomChatSubscriptionManager(di.secrets)

  const logger = di.logger.child('room-chat.ts')

  return (
    new Elysia({ name: 'room-chat', prefix: '/room/chat' })

      // 1. Give the Manager access to the Bun Server for broadcasting
      .onStart(({ server }) => {
        if (server) {
          chatManager.setServer(server)
          logger.info('Chat Manager linked to Bun Server')
        } else {
          logger.error('Failed to link Chat Manager: Server is null')
        }
      })

      .use(authMiddleware(di))
      .use(profileMiddleware(di))

      // 2. Define the WebSocket Endpoint
      .ws('/:uid/ws', {
        body: incomingMessageSchema,

        beforeHandle: async ctx => {
          const roomUid = ctx.params.uid
          const profile = ctx.profile

          const result = await roomAuthorization({ uid: roomUid, profile }, di)
          if (!result.success) return ctx.redirect(result.redirect)

          return { room: result.room, roomMember: result.roomMember }
        },
        /**
         * Handle New Connection
         */
        async open(ws) {
          const { uid } = ws.data.params
          const socketId = ws.id

          // A. Join the Valkey Subscription (Fan-out entry)
          // This ensures this Cloud Run instance is listening for messages for this room
          await chatManager.joinRoom(uid)

          // B. Subscribe the specific WebSocket client to the specific Topic
          // The topic name MUST match what the Manager publishes to
          ws.subscribe(`room:${uid}`)

          logger.info(`WebSocket Client ${socketId} joined room ${uid}`)
        },

        /**
         * Handle Incoming Message
         */
        async message(ws, { content, profileId }) {
          const { uid } = ws.data.params

          try {
            // --- 1. Database Persistence (Source of Truth) ---

            const [savedMessage] = await di.db
              .insert(roomMessage)
              .values({
                roomId: uid,
                profileId: profileId,
                content: content,
                // ... other defaults
              })
              .returning()

            // Mocking the DB return for this example:
            const payload: RoomMessage = {
              id: Date.now(), // Mock ID
              uid: crypto.randomUUID(),
              roomId: 0, // In real app, resolve uid -> roomId
              profileId: profileId,
              content: content,
              flags: [],
              claims: [],
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            // --- 2. Fan-Out (Broadcast) ---

            // We do NOT use ws.publish() here directly.
            // We send to Valkey. Valkey sends to All Instances (including us).
            // Our Manager receives from Valkey and calls server.publish().
            const messageString = JSON.stringify(payload)

            await chatManager.publishToRoom(uid, messageString)
          } catch (error) {
            logger.error(`[WS] Error processing message in room ${uid}`, error)
            ws.send(JSON.stringify({ error: 'Failed to process message' }))
          }
        },

        /**
         * Handle Disconnection
         */
        async close(ws) {
          const { uid } = ws.data.params

          // Unsubscribe from Valkey if this was the last user on this instance
          await chatManager.leaveRoom(uid)

          ws.unsubscribe(`room:${uid}`)

          logger.debug(`[WS] Client ${ws.id} left room ${uid}`)
        },
      })
  )
}
