/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import type { GUIHOAppMode as AppMode } from '@guiho40/sensacional'
import { languageCookieName } from '@guiho40/sensacional'
import { Span } from '@guiho40/time'
import { createCookie } from '@guiho40/cookie'

export { getLanguageCookie }
export type {}

function getLanguageCookie(env: AppMode) {
  const name = env === 'prod' ? languageCookieName : `${env}-${languageCookieName}`
  const domain = env === 'local' ? undefined : 'guiho.co'

  return createCookie(name, {
    maxAge: Span.days(400).asSeconds(),

    path: '/',
    sameSite: 'lax',

    domain,
  })
}
