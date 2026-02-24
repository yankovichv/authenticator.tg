import { presetStore, storeActions } from '@store/main'
import { getCache, setCache } from '@lib/cache'

/**
 * @typedef {Object} Store
 * @property {Function} dispatch
 * @property {Function} getState
 * @property {Function} replaceReducer
 * @property {Function} subscribe
 */

/**
 *
 * @param {Object} [defaultInitialState]
 * @returns {Promise<(Object|Store)>}
 */
export const createStore = async (defaultInitialState = {}) => {
  setCache(`store`, await presetStore(defaultInitialState))
  return getCache('store')
}

/**
 *
 * @returns {Object|null}
 */
export const getStore = () => {
  return getCache(`store`) || null
}

/**
 *
 * @returns {Object|null}
 */
export const getState = () => {
  const store = getStore()
  return store ? store.getState() : null
}

/**
 *
 * @param {string} key
 * @param {string} prop
 * @param {*} value
 * @param {Function} [callback]
 * @return {void}
 */
export const dispatchProp = (key, prop, value, callback) => {
  const store = getStore()
  if (store) {
    const action = storeActions.storeDispatchProp({ key, prop, value })
    store.dispatch(action).unwrap().then(callback)
  }
}

/**
 *
 * @param {string} key
 * @param {*} value
 * @param {Function} [callback]
 * @return {void}
 */
export const dispatchStore = (key, value, callback) => {
  const store = getStore()
  if (store) {
    const action = storeActions.storeDispatch({ key, value })
    store.dispatch(action).unwrap().then(callback)
  }
}

/**
 *
 * @param {string} key
 * @param {string} prop
 * @param {*} value
 * @param {Function} [callback]
 * @return {void}
 */
export const updateProp = (key, prop, value, callback) => {
  const store = getStore()
  if (store) {
    const action = storeActions.storeUpdateProp({ key, prop, value })
    store.dispatch(action).unwrap().then(callback)
  }
}

/**
 *
 * @param {string} key
 * @param {*} value
 * @param {Function} [callback]
 * @return {void}
 */
export const updateStore = (key, value, callback) => {
  const store = getStore()
  if (store) {
    const action = storeActions.storeUpdate({ key, value })
    store.dispatch(action).unwrap().then(callback)
  }
}
