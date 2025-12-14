/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: valkey.ts
 * Relative file path: core\app\valkey.ts
 * The relative path is the file path on workspace or folder.
 */

import Valkey from 'iovalkey'

import type { Secrets } from '#guiho/app/environment.js'

export { getValkey }
export type {}

function getValkey(secrets: Secrets, ) {
  return new Valkey({
    host: secrets.VALKEY_HOST,
    port: secrets.VALKEY_PORT,
    password: secrets.VALKEY_PASSWORD,
    db: 0,

    // Recommended settings for production
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  })
}
