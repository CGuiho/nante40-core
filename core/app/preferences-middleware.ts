/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

import { APP_DEFAULT_LANGUAGE } from '#guiho/app/constants.js'
import type { DependencyInjection } from '#guiho/app/dependency-injection.js'
import { parseLanguage } from '#guiho/app/language/language-parse.js'
import { parseTheme } from '#guiho/app/theme/theme-parser.js'
import { DEFAULT_THEME } from '#guiho/app/theme/theme.js'

import { Elysia } from 'elysia'

export { preferencesMiddleware }
export type {}

function preferencesMiddleware(_di: DependencyInjection) {
  return new Elysia({ name: 'preferences-middleware' }).resolve({ as: 'global' }, async ({ request }) => {
    // Extract Preferences
    const themePromise = parseTheme(request)
    const languagePromise = parseLanguage(request)

    const [themeResult, languageResult] = await Promise.all([themePromise, languagePromise])

    const theme = themeResult || DEFAULT_THEME
    const language = languageResult || APP_DEFAULT_LANGUAGE

    return { theme, language }
  })
}
