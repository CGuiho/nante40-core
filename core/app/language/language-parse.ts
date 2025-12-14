/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { getLanguageCookie } from '#guiho/app/language/language-cookie.js'
import {
  guihoAppMode,
  languages,
  languageSearchParamName,
  parseAcceptLanguage,
  shortLanguages,
  shortToFullLanguage,
} from '@guiho40/sensacional'

export { parseLanguage }
export type {}

async function parseLanguage(request: Request) {
  const url = new URL(request.url)
  const searchParamValue = url.searchParams.get(languageSearchParamName)
  const fromSearchParam = getLanguage(searchParamValue || '')

  const cookieValue = await getLanguageCookie(guihoAppMode()).parse(request.headers.get('Cookie') || '')
  const fromCookie = getLanguage(cookieValue || '')

  const fromAcceptLanguage = getLanguageFromHeader(request.headers.get('Accept-Language') || '')

  return fromSearchParam || fromCookie || fromAcceptLanguage || null
}

function getLanguageFromHeader(acceptLanguageHeader: string) {
  const shortsLanguagesSet = new Set(shortLanguages)
  const languages = parseAcceptLanguage(acceptLanguageHeader)

  for (const lang of languages) {
    // primary language subtag (e.g., "en")
    const baseLang = lang.code?.toLowerCase()

    if (baseLang && shortsLanguagesSet.has(baseLang as any)) {
      return shortToFullLanguage(baseLang as any)
    }
  }
  return null
}

function getLanguage(value: string) {
  return languages.find(language => language?.toLowerCase?.() === value?.toLowerCase?.())
}
