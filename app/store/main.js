import { configureStore, createReducer } from '@reduxjs/toolkit'
import { loggerMiddleware } from '@middleware/logger'
import WebAppHelper from '@helper/WebAppHelper'
import * as reducer from '@reducers'

const DEBUG = false

/**
 *
 * @return {Object}
 */
const config = {
  theme: new WebAppHelper().getTheme()
}

export const getInitialState = async (state = {}) => {
  return {
    ...config,
    ...state,
  }
}

/**
 *
 * @param {{entry: string}} [state]
 * @returns {Promise<{store: (Object|Store), actions: Object}>}
 */
export const presetStore = async (state = {}) => {
  const initialState = {
    ...(await getInitialState(state))
  }

  return configureStore({
    preloadedState: initialState,
    reducer: createReducer(initialState, (builder) => {
      reducer.mainStateReducers(builder)
      reducer.mainStatePropReducers(builder)
    }),
    middleware: (getDefaultMiddleware) => {
      const middlewares = getDefaultMiddleware()
      if (DEBUG) {
        return middlewares.concat(loggerMiddleware)
      }
      return middlewares
    },
  })
}

export const storeActions = {
  storeUpdate: reducer.storeUpdate,
  storeDispatch: reducer.storeDispatch,
  storeUpdateProp: reducer.storeUpdateProp,
  storeDispatchProp: reducer.storeDispatchProp,
}
