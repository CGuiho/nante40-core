/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { authMiddleware } from '#guiho/app/auth/auth-middleware.js'
import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { profile, profileDbGetViaUser } from '@guiho40/nante40'
import { HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR } from '@guiho40/sensacional'
import { Elysia } from 'elysia'

export { profileMiddleware }
export type {}

function profileMiddleware(di: DependencyInjection) {
  return new Elysia({ name: 'profile-middleware' })
    .use(authMiddleware(di))
    .resolve({ as: 'scoped' }, async ({ user, status }) => {
      const logger = di.logger.child('profile-middleware')

      if (!user) {
        logger.task.fail('Invalid user.')
        return status(HTTP_401_UNAUTHORIZED)
      }

      /**
       * @section Attempt to get Profile from database or create one.
       */
      let record = await profileDbGetViaUser(user.uid, di)
      if (record === null) {
        logger.warn('Existing Profile not found for user:', user.uid, ' creating one...')
        record = await di.db
          .insert(profile)
          .values({
            userId: user.id,
            userUid: user.uid,
            flags: ['early-adopter'],
            claims: ['early-adopter'],
          })
          .returning()
          .then(res => res[0])
      }

      if (record === null) {
        logger.error('Failed to get or create Profile for user:', user.uid)
        return status(HTTP_500_INTERNAL_SERVER_ERROR)
      }

      return { profile: record }
    })
}
