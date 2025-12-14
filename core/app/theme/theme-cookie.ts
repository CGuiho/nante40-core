/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import type { GUIHOAppMode } from '@guiho40/sensacional'
import { Span } from '@guiho40/time'
import { createCookie } from '@guiho40/cookie'
import { themeCookieName } from '#guiho/app/theme/theme.js'

export { getThemeCookie }
export type {}

function getThemeCookie(appMode: GUIHOAppMode | null) {
  const name = appMode === 'prod' ? themeCookieName : `${appMode}-${themeCookieName}`
  const domain = appMode === 'local' ? undefined : 'guiho.co'

  return createCookie(name, {
    maxAge: Span.days(400).asSeconds(),

    path: '/',
    sameSite: 'lax',

    domain,
  })
}
