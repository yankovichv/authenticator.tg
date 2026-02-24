import { createAsyncThunk } from '@reduxjs/toolkit'

export const ACTION_UPDATE_STORE = 'store/update'
export const ACTION_UPDATE_PROP = 'store/update/prop'

export const ACTION_DISPATCH_STORE = 'store/dispatch'
export const ACTION_DISPATCH_PROP = 'store/dispatch/prop'

export const storeUpdate = createAsyncThunk(
  ACTION_UPDATE_STORE,
  async (payload) => {
    return payload
  }
)

export const storeUpdateProp = createAsyncThunk(
  ACTION_UPDATE_PROP,
  async (payload) => {
    return payload
  }
)

export const storeDispatch = createAsyncThunk(
  ACTION_DISPATCH_STORE,
  async (payload) => {
    return payload
  }
)

export const storeDispatchProp = createAsyncThunk(
  ACTION_DISPATCH_PROP,
  async (payload) => {
    return payload
  }
)

export const mainStateReducers = (builder) => {
  builder.addCase(storeUpdate.fulfilled, (state, action) => {
    const { key, value } = action.payload
    state[key] = value
  })

  builder.addCase(storeDispatch.fulfilled, (state, action) => {
    const { key, value } = action.payload
    state[key] = value
  })
}

export const mainStatePropReducers = (builder) => {
  builder.addCase(storeUpdateProp.fulfilled, (state, action) => {
    const { key, prop, value } = action.payload
    state[key][prop] = value
  })

  builder.addCase(storeDispatchProp.fulfilled, (state, action) => {
    const { key, prop, value } = action.payload
    state[key][prop] = value
  })
}
