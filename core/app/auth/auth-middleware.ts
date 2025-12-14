/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { extractCredentials } from '#guiho/app/auth/credentials.js'
import type { DependencyInjection } from '#guiho/app/dependency-injection.js'
import { sessionDbGet, userDbGet } from '@guiho40/guiho'
import { ISODate } from '@guiho40/iso-8601'
import { HTTP_401_UNAUTHORIZED } from '@guiho40/sensacional'

import { Elysia } from 'elysia'

export { authExtractCredentials, authMiddleware, authOptionalMiddleware }
export type {}

function authExtractCredentials(di: DependencyInjection) {
  return new Elysia({ name: 'auth-extract-credentials' }).resolve({ as: 'global' }, async ({ request }) => {
    const credentials = await extractCredentials(request, di)
    return { credentials }
  })
}

function authMiddleware(di: DependencyInjection) {
  return new Elysia({ name: 'auth-middleware' })
  .use(authExtractCredentials(di))
  .resolve({ as: 'scoped' }, async ({ credentials, status }) => {
    const logger = di.logger.child('auth-middleware')
    
      if (!credentials) {
        logger.error('Unauthorized access.')
        return status(HTTP_401_UNAUTHORIZED)
      }

      const { sessionUid, userUid } = credentials

      // Fetch
      const userPromise = typeof userUid === 'string' && userDbGet(userUid, di)
      const sessionPromise = typeof sessionUid === 'string' && sessionDbGet(sessionUid, di)

      const [user, session] = await Promise.all([userPromise, sessionPromise])

      // Validation
      if (!session || session.deletedAt || ISODate.hasExpired(session.expiresAt.toISOString())) {
        logger.task.fail('Invalid session.')
        return status(HTTP_401_UNAUTHORIZED)
      }

      if (!user || user.deletedAt) {
        logger.task.fail('Invalid user.')
        return status(HTTP_401_UNAUTHORIZED)
      }

      // Context
      return { user, session, isAuthenticated: true }
    })
}

function authOptionalMiddleware(di: DependencyInjection) {
  return new Elysia({ name: 'auth-optional-middleware' })
    .use(authExtractCredentials(di))
    .resolve({ as: 'scoped' }, async ({ credentials }) => {
      if (!credentials) {
        di.logger.warn('No credentials found in optional auth middleware.')
        return { user: null, session: null, isAuthenticated: false }
      }

      const { sessionUid, userUid } = credentials

      // Fetch
      const userPromise = typeof userUid === 'string' && userDbGet(userUid, di)
      const sessionPromise = typeof sessionUid === 'string' && sessionDbGet(sessionUid, di)

      const [user, session] = await Promise.all([userPromise, sessionPromise])

      // Validation
      if (!session || session.deletedAt || ISODate.hasExpired(session.expiresAt.toISOString())) {
        di.logger.warn('Invalid session in optional auth middleware.')
        return { user: null, session: null, isAuthenticated: false }
      }

      if (!user || user.deletedAt) {
        di.logger.warn('Invalid user in optional auth middleware.')
        return { user: null, session: null, isAuthenticated: false }
      }

      // Context
      return { user, session, isAuthenticated: true }
    })
}
