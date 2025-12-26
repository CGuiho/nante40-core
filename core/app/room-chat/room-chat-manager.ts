/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import type { Secrets } from '#guiho/app/environment.js'
import { getValkey } from '#guiho/app/valkey.js'
import Valkey from 'iovalkey'

export { RoomChatSubscriptionManager, roomMessageChannelKey }
export type {}

const roomMessageChannelKey = (uid: string) => `room:message:${uid}`

class RoomChatSubscriptionManager {
  private subscriber: Valkey
  private publisher: Valkey
  private server: Bun.Server<unknown> | null = null

  // Track how many local users are in a specific room
  // Map<RoomUID, UserCount>
  private localRoomCounts = new Map<string, number>()

  constructor(secrets: Secrets) {
    this.subscriber = getValkey(secrets)
    this.publisher = getValkey(secrets)

    // When Valkey sends a message, broadcast it to LOCAL WebSocket clients
    this.subscriber.on('message', (channel, message) => {
      console.log(`[Valkey] Received message for ${channel}: ${message}`)
      // channel is "room:abc", message is JSON string
      // bun.server.publish sends to all local clients subscribed to this topic
      this.server?.publish(channel, message)
    })
  }

  public setServer(server: Bun.Server<unknown> | null) {
    this.server = server
  }

  /**
   * Called when a WebSocket connects to a room
   */
  public async joinRoom(roomUid: string) {
    const channel = roomMessageChannelKey(roomUid)
    const currentCount = this.localRoomCounts.get(channel) || 0

    // If this is the FIRST user on this instance for this room,
    // tell Valkey we want to receive messages for this room.
    if (currentCount === 0) {
      console.log(`[Valkey] Subscribing to ${channel}`)
      await this.subscriber.subscribe(channel)
    }

    this.localRoomCounts.set(channel, currentCount + 1)
  }

  /**
   * Called when a WebSocket disconnects
   */
  public async leaveRoom(roomUid: string) {
    const channel = roomMessageChannelKey(roomUid)
    const currentCount = this.localRoomCounts.get(channel) || 0

    if (currentCount <= 1) {
      // If this was the LAST user, stop listening to Valkey to save resources
      console.log(`[Valkey] Unsubscribing from ${channel}`)
      await this.subscriber.unsubscribe(channel)
      this.localRoomCounts.delete(channel)
    } else {
      this.localRoomCounts.set(channel, currentCount - 1)
    }
  }

  /**
   * Publish a message to the cluster
   */
  public async publishToRoom(roomUid: string, message: string) {
    // We publish to Valkey.
    // Valkey will send it back to us (if we are subscribed)
    // AND to all other instances.
    await this.publisher.publish(roomMessageChannelKey(roomUid), message)
  }

  /**
   * Cleanup method to prevent ghost connections
   */
  public async disconnect() {
    console.log('[RoomChatManager] 🛑 Disconnecting services...')

    // Remove all listeners to stop processing events
    this.subscriber.removeAllListeners('message')

    // Quit Redis connections
    await Promise.all([this.subscriber.quit(), this.publisher.quit()])

    this.server = null
    this.localRoomCounts.clear()
    console.log('[RoomChatManager] Services stopped.')
  }
}
