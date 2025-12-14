/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */


export { DEFAULT_THEME, themeCookieName, themeList, themeSearchParamName }
export type { Theme }

type Theme = 'light' | 'dark'

const themeCookieName = 'x40-suraia'
const themeSearchParamName = 'theme'
const DEFAULT_THEME = <Theme>'light'
const themeList = <Theme[]>['light', 'dark']
