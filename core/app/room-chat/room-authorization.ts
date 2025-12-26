/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import type { DependencyInjection } from '#guiho/app/dependency-injection.js'
import { helm } from '@guiho40/helm'
import { roomDbGet, roomMember as roomMemberTable, type Profile } from '@guiho40/nante40'
import { and, eq } from 'drizzle-orm'

export { roomAuthorization }
export type { }

interface RoomAuthorizationOptions {
  uid: string
  profile: Profile
}

async function roomAuthorization(options: RoomAuthorizationOptions, di: DependencyInjection) {
  const logger = di.logger.child('room-authorization')

  const { uid, profile } = options

  /**
   * @section Get Room
   */
  const roomUid = uid
  const room = await roomDbGet(roomUid, di)

  /**
   * @section Check room existence
   */
  if (!room) {
    logger.error(`Room with id ${roomUid} not found`)
    return { success: false, redirect: helm['nante40.guiho.co']('/room/:uid/404', { uid: roomUid }) } as const
  }

  /**
   * @section Authorization
   * One of the conditions bellow must be true to access this page:
   * @condition 1. The current user, represented by profile, must be a member of the room.
   * @fallback If condition 1 is not met, redirect to join page.
   * @condition 2. RoomMember cannot be banned.
   * @fallback If condition 2 is not met, redirect to banned page.
   * @condition 3. RoomMember cannot be suspended.
   * @fallback If condition 3 is not met, redirect to suspended page.
   */

  // Perform DB lookup to check if user is a member of the room.
  const [member] = await di.db
    .select()
    .from(roomMemberTable)
    .where(and(eq(roomMemberTable.roomId, room.id), eq(roomMemberTable.profileId, profile.id)))
    .limit(1)

  if (!member) {
    logger.error(`User has no access to room with id ${roomUid}`)
    return { success: false, redirect: helm['nante40.guiho.co']('/room/:uid/join', { uid: options.uid }) } as const
  }

  if (member.status === 'banned') {
    logger.error(`User is banned from room with id ${roomUid}`)
    return { success: false, redirect: helm['nante40.guiho.co']('/room/:uid/banned', { uid: options.uid }) } as const
  }

  if (member.status === 'suspended') {
    logger.error(`User is suspended from room with id ${roomUid}`)
    return { success: false, redirect: helm['nante40.guiho.co']('/room/:uid/suspended', { uid: options.uid }) } as const
  }

  return { success: true, room, roomMember: member } as const
}
