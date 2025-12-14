/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { authMiddleware } from '#guiho/app/auth/auth-middleware.js'
import type { DependencyInjection } from '#guiho/app/dependency-injection.js'
import { paginationSchema, thresholds } from '#guiho/app/pagination.js'
import { session, sessionCacheKey, sessionDbGet, sessionSchema } from '@guiho40/guiho'
import { desc, eq, isNull } from 'drizzle-orm'
import { Elysia, NotFoundError, t } from 'elysia'

export { sessionService }
export type {}

function sessionService(di: DependencyInjection) {
  const { db, valkey } = di

  const sessionCreateSchema = t.Omit(sessionSchema, ['id', 'uid', 'deletedAt', 'createdAt', 'updatedAt'])
  const sessionUpdateSchema = t.Omit(sessionSchema, ['id', 'uid', 'deletedAt', 'createdAt', 'updatedAt'])

  return new Elysia({ name: 'session', prefix: '/session' })
    .model({
      session: sessionSchema,
      sessionCreate: sessionCreateSchema,
      sessionUpdate: sessionUpdateSchema,
    })

    .use(authMiddleware(di))

    .get('/active', async ({ session }) => session)

    .get(
      '/',
      async ({ query }) => {
        const { limit, offset } = thresholds(query)

        return await db.query.session.findMany({
          where: isNull(session.deletedAt), // Exclude soft-deleted sessions
          orderBy: desc(session.createdAt), // Order by newest first for consistent pagination
          limit,
          offset,
        })
      },
      {
        query: paginationSchema,
        response: t.Array(sessionSchema),
        detail: { description: 'Retrieves a paginated list of active sessions.' },
      },
    )

    .get(
      '/:uid',
      async ({ params: { uid } }) => {
        // Find by UID and ensure the session is not soft-deleted
        const record = await sessionDbGet(uid, di)
        if (!record || record.deletedAt) throw new NotFoundError(`Session with UID '${uid}' not found.`)
        return record
      },
      {
        params: t.Object({ uid: t.String({ description: "The session's public unique identifier." }) }),
        response: sessionSchema,
        detail: { description: 'Retrieves a single session by their public unique identifier (UID).' },
      },
    )

    .delete(
      '/:uid/soft',
      async ({ params: { uid }, user, status }) => {
        const record = await sessionDbGet(uid, di)
        if (!record) throw new NotFoundError(`Session with UID '${uid}' not found.`)

        // Authorization
        if (record.userId !== user.id) return status(404, null)

        const [updated] = await db
          .update(session)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(session.uid, uid))
          .returning()

        await valkey.del(sessionCacheKey(uid))

        return updated
      },
      {
        params: t.Object({ uid: t.String() }),
        response: {
          200: sessionSchema,
          404: t.Null(),
        },
        detail: { description: 'Soft deletes a session.' },
      },
    )
    .delete(
      '/:uid/hard',
      async ({ params: { uid }, user, status }) => {
        const record = await sessionDbGet(uid, di)
        if (!record) throw new NotFoundError(`Session with UID '${uid}' not found.`)

        // Authorization
        if (record.userId !== user.id) return status(404, null)

        // Deletion
        await db.delete(session).where(eq(session.uid, uid))

        // Cache Invalidation
        await valkey.del(sessionCacheKey(uid))

        return null
      },
      {
        params: t.Object({ uid: t.String() }),
        response: {
          200: t.Null(),
          404: t.Null(),
        },
        detail: { description: 'Hard deletes a session.' },
      },
    )
}
