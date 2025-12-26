/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { authMiddleware } from '#guiho/app/auth/auth-middleware.js'
import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { profileMiddleware } from '#guiho/app/profile/profile-middleware.js'
import { roomAuthorization } from '#guiho/app/room-chat/room-authorization.js'
import { RoomChatSubscriptionManager, roomMessageChannelKey } from '#guiho/app/room-chat/room-chat-manager.js'
import { roomMessage as roomMessageTable } from '@guiho40/nante40'
import { Elysia, t } from 'elysia'

export { roomChatService }
export type {}

/**
 * The Input shape coming from the WebSocket client
 */
const incomingMessageSchema = t.Object({
  content: t.String({ minLength: 1, maxLength: 2000 }),
})

function roomChatService(di: DependencyInjection) {
  /**
   * @section Singleton Manager
   * Since this function is called exactly once, this instance acts as a Singleton.
   */
  const chatManager = new RoomChatSubscriptionManager(di.secrets)

  const logger = di.logger.child('room-chat.ts')

  return (
    new Elysia({ name: 'room-chat', prefix: '/room/:uid/chat' })
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

      // Resolve runs for HTTP upgrade requests too.
      // This ensures 'room' and 'roomMember' exist in ctx before WS upgrade.
      .resolve(async ctx => {
        const roomUid = ctx.params.uid
        const profile = ctx.profile

        const result = await roomAuthorization({ uid: roomUid, profile }, di)
        if (!result.success) throw ctx.redirect(result.redirect)

        return { room: result.room, roomMember: result.roomMember }
      })

      // 2. Define the WebSocket Endpoint
      .ws('/ws', {
        body: incomingMessageSchema,

        // Sanity check before upgrade (though .resolve handles most of this)
        async beforeHandle({ room, roomMember, profile, status }) {
          if (!profile || !room || !roomMember) return status(401, 'Unauthorized')
          return
        },

        /**
         * Handle New Connection
         */
        async open(ws) {
          const { room } = ws.data
          const socketId = ws.id

          try {
            // A. Join the Valkey Subscription (Fan-out entry)
            // This ensures this Cloud Run instance is listening for messages for this room
            await chatManager.joinRoom(room.uid)

            // B. Subscribe the specific WebSocket client to the specific Topic
            // The topic name MUST match what the Manager publishes to
            ws.subscribe(roomMessageChannelKey(room.uid))

            logger.info(`WebSocket Client ${socketId} joined room ${room.uid}`)
          } catch (err) {
            logger.error(`Failed to setup WebSocket for client ${socketId} in room ${room.uid}`, err)
            // Close with internal server error code if Valkey fails
            ws.close(1011, 'Internal Server Error')
          }
        },

        /**
         * Handle Incoming Message
         */
        async message(ws, { content }) {
          const { room, profile } = ws.data

          try {
            // 1. Persist to DB
            const [savedMessage] = await di.db
              .insert(roomMessageTable)
              .values({
                roomId: room.id,
                profileId: profile.id,
                content: content,
              })
              .returning()

            // 2. Fan-out via Valkey
            // We do NOT use ws.publish() here directly.
            // We send to Valkey. Valkey sends to All Instances (including us).
            // Our Manager receives from Valkey and calls server.publish().
            const messageString = JSON.stringify(savedMessage)

            await chatManager.publishToRoom(room.uid, messageString)
          } catch (error) {
            logger.error(`[WS] Error processing message in room ${room.uid}`, error)
            ws.send(JSON.stringify({ error: 'Failed to process message' }))
          }
        },

        /**
         * Handle Disconnection
         */
        async close(ws) {
          const { room } = ws.data

          try {
            // Unsubscribe from Valkey if this was the last user on this instance
            await chatManager.leaveRoom(room.uid)

            ws.unsubscribe(roomMessageChannelKey(room.uid))

            logger.info(`WebSocket Client ${ws.id} left room ${room.uid}`)
          } catch (error) {
            logger.error(`[WS] Error during cleanup for client ${ws.id} in room ${room.uid}`, error)
          }
        },
      })
  )
}
