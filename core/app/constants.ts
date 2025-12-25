/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { random, type Language } from '@guiho40/sensacional'
import { Span } from '@guiho40/time'

/**
 * File name: constants.ts
 * Relative file path: core\app\constants.ts
 * The relative path is the file path on workspace or folder.
 */

export {
  APP_DEFAULT_LANGUAGE,
  APP_DEFAULT_LOCALE,
  APP_ID,
  APP_NAME,
  APP_ORIGIN,
  CORS_ALLOWED_ORIGINS_DEVELOPMENT,
  CORS_ALLOWED_ORIGINS_PRODUCTION,
  DEFAULT_CACHE_SPAN,
}
export type {}

const APP_ID = 'G1000' as const
const APP_NAME = 'guiho-nante40-core' as const
const APP_ORIGIN = 'https://core.nante40.guiho.co' as const

const APP_DEFAULT_LANGUAGE: Language = 'pt-PT' as const
const APP_DEFAULT_LOCALE = 'pt-PT' as const

const DEFAULT_CACHE_SPAN = () => Span.minutes(random(10, 15))

// prettier-ignore
/**
 * CORS Allowed Origins
 * @warning Keep this list updated with all frontend applications domains.
 * @warning Do not use wildcards in production.
 * @warning Do not include localhost or development domains here.
 * @warning Do not append trailing slashes to the domains.
 */
const CORS_ALLOWED_ORIGINS_PRODUCTION = [
                      'https://guiho.co',
                  'https://www.guiho.co',

                 'https://core.guiho.co',
                 'https://auth.guiho.co',
              'https://account.guiho.co',

             'https://razura40.guiho.co',
        'https://core.razura40.guiho.co',

              'https://nante40.guiho.co',
         'https://core.nante40.guiho.co',

             'https://soneca40.guiho.co',
        'https://core.soneca40.guiho.co',

               'https://kino40.guiho.co',
          'https://core.kino40.guiho.co',

             'https://destro40.guiho.co',
        'https://core.destro40.guiho.co',

               'https://turmab.guiho.co',
          'https://core.turmab.guiho.co',

            'https://xawande40.guiho.co',
       'https://core.xawande40.guiho.co',

               'https://cristo.guiho.co',
          'https://core.cristo.guiho.co',

           'https://red-carpet.guiho.co',
      'https://core.red-carpet.guiho.co',

               'https://liga40.guiho.co',
          'https://core.liga40.guiho.co',

             'https://kitadi40.guiho.co',
        'https://core.kitadi40.guiho.co',

              'https://banda40.guiho.co',
         'https://core.banda40.guiho.co',

] as const

const CORS_ALLOWED_ORIGINS_DEVELOPMENT = ['http://localhost:4001'] as const
