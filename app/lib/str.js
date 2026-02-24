
/**
 *
 * @param {string} str
 * @param {string} chars
 * @returns {string}
 */
export const trim = (str, chars = '\\s\\n') => {
  const regExp = new RegExp(`^[${chars}]+|[${chars}]+$`);
  return str ? String(str).replace(regExp, '') : str
}
