/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { authMiddleware } from '#guiho/app/auth/auth-middleware.js'
import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { profileMiddleware } from '#guiho/app/profile/profile-middleware.js'
import { Elysia } from 'elysia'

export { profileService }
export type { }

function profileService(di: DependencyInjection) {
  return new Elysia({ name: 'profile', prefix: '/profile' })
    .use(authMiddleware(di))
    .use(profileMiddleware(di))
    .get('/', ({ profile }) => profile)
}
