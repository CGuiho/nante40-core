/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { getThemeCookie } from '#guiho/app/theme/theme-cookie.js'
import { themeList, themeSearchParamName } from '#guiho/app/theme/theme.js'
import { guihoAppMode } from '@guiho40/sensacional'


export { parseTheme }
export type {}

async function parseTheme(request: Request) {
  const url = new URL(request.url)
  const searchParamValue = url.searchParams.get(themeSearchParamName)
  const fromSearchParam = getTheme(searchParamValue || '')

  const cookieValue = await getThemeCookie(guihoAppMode()).parse(request.headers.get('Cookie') || '')
  const fromCookie = getTheme(cookieValue || '')

  return fromSearchParam || fromCookie || null
}
function getTheme(value: string) {
  return themeList.find(theme => theme?.toLowerCase?.() === value?.toLowerCase?.())
}
