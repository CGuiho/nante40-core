/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { createCookie } from '@guiho40/cookie'
import type { GUIHOAppMode } from '@guiho40/sensacional'
import { Span } from '@guiho40/time'

export { getSessionCookie, SESSION_DURATION }
export type {}

const SESSION_COOKIE_NAME = 'x40-luisa' as const
const SESSION_DURATION = Span.days(180)

interface Protection {
  SESSION_SIGNING_KEY: string
  SESSION_PAST_SIGNING_KEY_0: string
  SESSION_PAST_SIGNING_KEY_1: string
  SESSION_PAST_SIGNING_KEY_2: string
  SESSION_PAST_SIGNING_KEY_3: string
}

function getSessionCookie(protection: Protection, appMode?: GUIHOAppMode) {
  const name = appMode === 'prod' ? SESSION_COOKIE_NAME : `${appMode}--${SESSION_COOKIE_NAME}`

  return createCookie(
    name,
    {
      path: '/',
      sameSite: 'lax',

      httpOnly: true,

      maxAge: SESSION_DURATION.asSeconds(),

      secure: appMode === 'local' ? undefined : true,
      domain: appMode === 'local' ? undefined : 'guiho.co',
    },
    {
      signingKey: protection.SESSION_SIGNING_KEY,
      previousSigningKeys: [
        protection.SESSION_PAST_SIGNING_KEY_0,
        protection.SESSION_PAST_SIGNING_KEY_1,
        protection.SESSION_PAST_SIGNING_KEY_2,
        protection.SESSION_PAST_SIGNING_KEY_3,
      ],
    },
  )
}
