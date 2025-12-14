// /**
//  * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
//  */

// /**
//  * File name: user.ts
//  * Relative file path: core\app\user.ts
//  * The relative path is the file path on workspace or folder.
//  */

// import { Elysia, NotFoundError, t } from 'elysia'

// import { authMiddleware } from '#guiho/app/auth/auth-middleware'
// import type { DependencyInjection } from '#guiho/app/dependency-injection'
// import { paginationSchema, thresholds } from '#guiho/app/pagination'
// import { user, userCacheKey, userDbGet, userSchema } from '@guiho40/guiho'
// import { desc, eq, isNull } from 'drizzle-orm'

// export { userService }
// export type {}

// /**
//  * Creates the CRUD service for the User entity.
//  * @param di - The dependency injection container.
//  * @returns An Elysia instance representing the user service.
//  */
// function userService(di: DependencyInjection) {
//   const { db, valkey } = di

//   const userCreateSchema = t.Omit(userSchema, ['id', 'uid', 'deletedAt', 'createdAt', 'updatedAt'])
//   const userUpdateSchema = t.Omit(userSchema, ['id', 'uid', 'deletedAt', 'createdAt', 'updatedAt'])

//   return new Elysia({ name: 'user', prefix: '/user' })
//     .model({
//       user: userSchema,
//       userCreate: userCreateSchema,
//       userUpdate: userUpdateSchema,
//     })

//     .use(authMiddleware(di))

//     .get(
//       '/',
//       async ({ query }) => {
//         const { limit, offset } = thresholds(query)

//         return await db.query.user.findMany({
//           where: isNull(user.deletedAt), // Exclude soft-deleted users
//           orderBy: desc(user.createdAt), // Order by newest first for consistent pagination
//           limit,
//           offset,
//         })
//       },
//       {
//         query: paginationSchema,
//         response: t.Array(userSchema),
//         detail: { description: 'Retrieves a paginated list of active users.' },
//       },
//     )

//     .get(
//       '/:uid',
//       async ({ params: { uid } }) => {
//         // Find by UID and ensure the user is not soft-deleted
//         const record = await userDbGet(uid, di)
//         if (!record || record.deletedAt) throw new NotFoundError(`User with UID '${uid}' not found.`)
//         return record
//       },
//       {
//         params: t.Object({ uid: t.String({ description: "The user's public unique identifier." }) }),
//         response: userSchema,
//         detail: { description: 'Retrieves a single user by their public unique identifier (UID).' },
//       },
//     )

//     .get('/whoami', async ({ user }) => user)

//     .get(
//       '/email-exists',
//       async ({ query: { email } }) => {
//         const existing = await db.query.user.findFirst({
//           where: eq(user.email, email),
//           columns: { id: true },
//         })
//         return { exists: !!existing }
//       },
//       {
//         query: t.Object({ email: t.String({ format: 'email' }) }),
//         response: t.Object({ exists: t.Boolean() }),
//         detail: { description: 'Checks if an email address is already registered.' },
//       },
//     )
//     .get(
//       '/username-exists',
//       async ({ query: { username } }) => {
//         const existing = await db.query.user.findFirst({
//           where: eq(user.username, username),
//           columns: { id: true },
//         })
//         return { exists: !!existing }
//       },
//       {
//         query: t.Object({ username: t.String() }),
//         response: t.Object({ exists: t.Boolean() }),
//         detail: { description: 'Checks if a username is already taken.' },
//       },
//     )

//     .patch(
//       '/:uid/display-name',
//       async ({ params: { uid }, body: { displayName }, user: authUser, set }) => {
//         if (authUser.uid !== uid) {
//           set.status = 403
//           throw new Error('Forbidden')
//         }

//         const [updatedUser] = await db
//           .update(user)
//           .set({ displayName, updatedAt: new Date() })
//           .where(eq(user.uid, uid))
//           .returning()

//         if (!updatedUser) throw new NotFoundError('User not found')

//         await valkey.del(userCacheKey(uid))

//         return updatedUser
//       },
//       {
//         params: t.Object({ uid: t.String() }),
//         body: t.Object({ displayName: t.String({ minLength: 1 }) }),
//         response: 'user',
//         detail: { description: "Updates the user's display name." },
//       },
//     )
//     .patch(
//       '/:uid/username',
//       async ({ params: { uid }, body: { username }, user: authUser, set }) => {
//         if (authUser.uid !== uid) {
//           set.status = 403
//           throw new Error('Forbidden')
//         }

//         // Check uniqueness
//         const existing = await db.query.user.findFirst({ where: eq(user.username, username) })
//         if (existing) {
//           set.status = 409
//           throw new Error('Username already taken.')
//         }

//         const [updatedUser] = await db
//           .update(user)
//           .set({ username, updatedAt: new Date() })
//           .where(eq(user.uid, uid))
//           .returning()

//         if (!updatedUser) throw new NotFoundError('User not found')

//         await valkey.del(userCacheKey(uid))

//         return updatedUser
//       },
//       {
//         params: t.Object({ uid: t.String() }),
//         body: t.Object({ username: t.String({ minLength: 3, pattern: '^[a-zA-Z0-9_-]+$' }) }),
//         response: 'user',
//         detail: { description: "Updates the user's username." },
//       },
//     )

//   // .patch('/:uid/photo')

//   // .post('/:uid/email/send-code') // receive new email
//   // .patch('/:uid/email') // receive code and new email

//   // .delete('/:uid/hard')
//   // .delete('/:uid/soft')
// }
