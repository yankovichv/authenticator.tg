import objectPath from 'object-path'

self.__cache__ = self.__cache__ || {}

/**
 * Usage example:
 *  const value = getFromWindowCache('test', (min, max) => {
 *    return random(min, max)
 *  }, 1, 2)
 *  First call will remember value.
 *  Second call will take value from cache.
 *
 * @param {string|number|[]} path
 * @param {Function} func
 * @param {...*} payload
 * @returns {*}
 */
export const cacheFunc = (path, func, ...payload) => {
  if (!hasCache(path)) {
    setCache(path, func(...payload))
  }
  return getCache(path)
}


/**
 * Usage example:
 *  const value = getFromWindowCache('test', async () => {
 *    return new Promise((resolve) => {
 *      setTimeout(() => resolve(random(1, 10)), 2000)
 *    })
 *  })
 *
 * @param {string|number|[]} path
 * @param {Function} func
 * @param {...*} payload
 * @returns {Promise<*>}
 */
export const cacheFuncAsync = async (path, func, ...payload) => {
  if (!hasCache(path)) {
    const data = await func(...payload)
    setCache(path, data)
  }
  return getCache(path)
}

/**
 *
 * @param {string|number|[]} path
 * @param {*} value
 * @returns {void}
 */
export const pushCache = (path, value) => {
  objectPath.push(self.__cache__, path, value)
}

/**
 *
 * @param {string|number|[]} path
 * @param {*} value
 * @returns {void}
 */
export const setCache = (path, value) => {
  objectPath.set(self.__cache__, path, value)
}

/**
 *
 * @param {string|number|[]} path
 * @param {null} [defaultValue]
 * @returns {*}
 */
export const getCache = (path, defaultValue = null) => {
  return objectPath.get(self.__cache__, path, defaultValue)
}

/**
 *
 * @param {string|number|[]} path
 * @returns {void}
 */
export const clearCache = (path) => {
  if (hasCache(path)) {
    objectPath.del(self.__cache__, path)
  }
}

/**
 *
 * @param {string|number|[]} path
 * @returns {boolean}
 */
export const hasCache = (path) => {
  return objectPath.has(self.__cache__, path)
}
