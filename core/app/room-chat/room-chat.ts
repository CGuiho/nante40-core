/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { RoomChatSubscriptionManager } from '#guiho/app/room-chat/room-chat-manager.js'
import { Elysia } from 'elysia'

export { roomChatService }
export type {}

function roomChatService(di: DependencyInjection) {
  /**
   * @section Singletons
   */
  const roomChatSubscriptionManager = new RoomChatSubscriptionManager(di.secrets)

  return new Elysia({ name: 'room-chat', prefix: '/room/chat' }).post('/join', ({ body }) => {})
}
