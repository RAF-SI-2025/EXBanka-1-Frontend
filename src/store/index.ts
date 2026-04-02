import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import transferReducer from '@/store/slices/transferSlice'
import paymentReducer from '@/store/slices/paymentSlice'
import loanReducer from '@/store/slices/loanSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  transfer: transferReducer,
  payment: paymentReducer,
  loan: loanReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
