/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: app-logger.ts
 * Relative file path: core\app\app-logger.ts
 * The relative path is the file path on workspace or folder.
 */

import { createLogger } from '@guiho40/logger'

import { APP_ID, APP_NAME } from '#guiho/app/constants'
import packageJson from '../package.json'

export { appLogger }
export type {}

const appLogger = createLogger(APP_ID, APP_NAME, 'v' + packageJson.version)
