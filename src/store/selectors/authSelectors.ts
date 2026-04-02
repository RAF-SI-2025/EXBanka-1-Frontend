import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export const selectAuthState = (state: RootState) => state.auth

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => auth.status === 'authenticated'
)

export const selectIsAdmin = createSelector(
  selectAuthState,
  (auth) => auth.user?.role === 'EmployeeAdmin'
)

export const selectHasPermission = (state: RootState, permission: string): boolean => {
  const permissions = state.auth.user?.permissions ?? []
  return permissions.includes(permission)
}

export const selectCurrentUser = createSelector(selectAuthState, (auth) => auth.user)
