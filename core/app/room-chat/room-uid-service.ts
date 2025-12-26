/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { authMiddleware } from '#guiho/app/auth/auth-middleware.js'
import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { paginationSchema, thresholds, type PaginationFull } from '#guiho/app/pagination.js'
import { profileMiddleware } from '#guiho/app/profile/profile-middleware.js'
import { roomAuthorization } from '#guiho/app/room-chat/room-authorization.js'
import { roomDbGet, roomMemberDbGet } from '@guiho40/nante40'
import { Elysia, t } from 'elysia'

import { userDbGet, user as userTable } from '@guiho40/guiho'
import { profile, profile as profileTable, roomMember as roomMemberTable } from '@guiho40/nante40'
import { count, eq, inArray } from 'drizzle-orm'

export { roomUidService }
export type {}

function roomUidService(di: DependencyInjection) {
  return (
    new Elysia({ name: 'room-uid', prefix: '/room/:uid' })
      .use(authMiddleware(di))
      .use(profileMiddleware(di))

      .resolve(async ctx => {
        const roomUid = ctx.params.uid
        const profile = ctx.profile

        const result = await roomAuthorization({ uid: roomUid, profile }, di)
        if (!result.success) throw ctx.redirect(result.redirect)

        return { room: result.room, roomMember: result.roomMember }
      })

      .onBeforeHandle(async ctx => {
        if (!ctx.profile || !ctx.room || !ctx.roomMember) return ctx.status(401, 'Unauthorized')
        return
      })

      .get('/', async ctx => await roomDbGet(ctx.params.uid, di))

      .get(
        '/member',
        async ctx => {
          const { limit, offset, page, size } = thresholds(ctx.query)
          const membersDataPromise = di.db
            .select({ member: roomMemberTable, profile: profile })
            .from(roomMemberTable)
            .innerJoin(profile, eq(roomMemberTable.profileId, profile.id))
            .where(eq(roomMemberTable.roomId, ctx.room.id))
            .limit(limit)
            .offset(offset)

          const membersCountPromise = di.db
            .select({ count: count() })
            .from(roomMemberTable)
            .where(eq(roomMemberTable.roomId, ctx.room.id))
            .then(res => Number(res[0].count))

          const [members, membersCount] = await Promise.all([membersDataPromise, membersCountPromise])

          const pagination: PaginationFull = {
            page,
            size,
            total: membersCount,
          }
          return { members, pagination }
        },
        { query: paginationSchema },
      )
      .get(
        '/member/with-user',
        async ctx => {
          const { limit, offset, page, size } = thresholds(ctx.query)
          const membersDataPromise = di.db
            .select({ member: roomMemberTable, profile: profile })
            .from(roomMemberTable)
            .innerJoin(profile, eq(roomMemberTable.profileId, profile.id))
            .where(eq(roomMemberTable.roomId, ctx.room.id))
            .limit(limit)
            .offset(offset)

          const membersCountPromise = di.db
            .select({ count: count() })
            .from(roomMemberTable)
            .where(eq(roomMemberTable.roomId, ctx.room.id))
            .then(res => Number(res[0].count))

          const [members, membersCount] = await Promise.all([membersDataPromise, membersCountPromise])

          const memberUserIds = [...new Set(members.map(d => d.profile.userId))]
          const memberUsers =
            memberUserIds.length > 0
              ? await di.guihoDb.select().from(userTable).where(inArray(userTable.id, memberUserIds))
              : []

          const membersWithUsers = members
            .map(({ member, profile }) => {
              const user = memberUsers.find(u => u.id === profile.userId)
              return user ? { member, user } : null
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)

          const pagination: PaginationFull = {
            page,
            size,
            total: membersCount,
          }
          return { membersWithUsers, pagination }
        },
        { query: paginationSchema },
      )

      .get('/member/:muid', async ctx => await roomMemberDbGet(ctx.params.muid, di), {
        params: t.Object({ muid: t.String() }),
      })
      .get(
        '/member/:muid/with-profile-user',
        async ctx => {
          const { member, profile } = await di.db
            .select({ member: roomMemberTable, profile: profileTable })
            .from(roomMemberTable)
            .innerJoin(profileTable, eq(roomMemberTable.profileId, profileTable.id))
            .where(eq(roomMemberTable.uid, ctx.params.muid))
            .then(res => res[0])

          const user = await userDbGet(profile.userId, di)
          return { member, profile, user }
        },
        {
          params: t.Object({ muid: t.String() }),
        },
      )
  )
}
