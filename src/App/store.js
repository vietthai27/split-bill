import { configureStore } from '@reduxjs/toolkit'
import appSliceReducer from './appSlice'

export const store = configureStore({
  reducer: {
    app: appSliceReducer,
  },
})