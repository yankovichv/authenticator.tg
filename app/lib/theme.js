import objectPath from 'object-path'

export const THEME_DARK = 'dark'
export const THEME_LIGHT = 'light'

export const THEMES = [THEME_DARK, THEME_LIGHT]

export const COLORS = {
  fixed: {
    white_100: '#FFFFFF'
  },
  [THEME_DARK]: {
    foreground: '#FFFFFF',
    background: '#131314',
    warning_100: '#FF4530',
  },
  [THEME_LIGHT]: {
    foreground: '#131314',
    background: '#FFFFFF',
    warning_100: '#FF331C'
  }
}

/**
 *
 * @param {'dark'|'light'|'fixed'} theme
 * @param {string} key
 */
export const getColor = (theme, key) => {
  return objectPath.get(COLORS, [theme, key])
}

/**
 *
 * @param {Object} [settings]
 * @returns {string}
 */
export const ensureTheme = (settings = {}) => {
  const storageTheme = objectPath.get(settings, ['theme'], null)
  if (storageTheme && THEMES.includes(storageTheme)) {
    return storageTheme
  }

  const { matches } = window.matchMedia(`(prefers-color-scheme: ${THEME_DARK})`)
  return matches ? THEME_DARK : THEME_LIGHT
}

/**
 * @param {string} theme
 * @callback systemThemeChange
 */

/**
 *
 * @param {Function} callback
 */
export const onSystemThemeChange = (callback) => {
  window.matchMedia(`(prefers-color-scheme: ${THEME_DARK})`)
    .addEventListener('change', ({ matches }) => callback(matches ? THEME_DARK : THEME_LIGHT))
}
