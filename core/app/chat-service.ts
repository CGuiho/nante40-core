/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { Elysia, t } from 'elysia'

export { chatService }
export type {}

/**
 * Creates a simple WebSocket chat service.
 * @param di The dependency injection container.
 * @returns An Elysia instance representing the chat service.
 */
function chatService(di: DependencyInjection) {
  const { logger } = di

  return new Elysia({ name: 'chat-service', prefix: '/chat' }).ws('/', {
    /**
     * Schema validation for incoming messages.
     */
    body: t.Object({
      message: t.String({ minLength: 1 }),
    }),

    /**
     * `open` is a lifecycle hook that runs when a new client connects.
     * @param ws The WebSocket instance for the connected client.
     */
    open(ws) {
      logger.info(`${ws.id} has connected.`)

      ws.subscribe('global-chat-room')
      // Announce that a new user has joined the chat.
      ws.publish('global-chat-room', `--- ${ws.id} has joined the chat ---`)
    },

    /**
     * `message` is a lifecycle hook that runs when the server receives a message
     * from a client. The `body` is automatically parsed and validated.
     * @param ws The WebSocket instance for the sending client.
     * @param body The validated message object.
     */
    message(ws, body) {
      ws.publish('global-chat-room', {
        id: ws.id,
        message: body.message,
        timestamp: new Date().toISOString(),
      })
    },

    /**
     * `close` is a lifecycle hook that runs when a client disconnects.
     * @param ws The WebSocket instance for the disconnecting client.
     */
    close(ws) {
      logger.info(`${ws.id} has disconnected.`)

      // Announce that the user has left the chat.
      ws.publish('global-chat-room', `--- ${ws.id} has left the chat ---`)
    },
  })
}
