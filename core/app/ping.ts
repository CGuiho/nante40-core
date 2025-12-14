/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: ping.ts
 * Relative file path: core\app\ping.ts
 * The relative path is the file path on workspace or folder.
 */

import { APP_ID, APP_NAME } from '#guiho/app/constants'
import type { DependencyInjection } from '#guiho/app/dependency-injection'
import { Elysia } from 'elysia'

export { pingService }
export type {}

function pingService(di: DependencyInjection) {
  const logger = di.logger.child('ping')

  return new Elysia({ name: 'ping', prefix: '/ping' }).get('/', () => {
    const message = `${APP_ID} ${APP_NAME} ${di.packageJson.version}`
    const prefixedMessage = `pong ❤️‍🔥 ${new Date().toISOString()} ${message}`
    logger.pulse(message)
    return prefixedMessage
  })
}
