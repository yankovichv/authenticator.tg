
/**
 *
 * @returns {string}
 */
  // eslint-disable-next-line no-undef
export const mode = (process.env.MODE || 'production')

/**
 *
 * @returns {boolean}
 */
export const isProd = mode === 'production'

/**
 *
 * @returns {boolean}
 */
export const isDev = !isProd
