import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export const selectAuthState = (state: RootState) => state.auth

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => auth.status === 'authenticated'
)

function permissionMatches(granted: string, required: string): boolean {
  return granted === required || granted.startsWith(`${required}.`)
}

export const selectIsAdmin = createSelector(
  selectAuthState,
  (auth) => auth.user?.role === 'EmployeeAdmin'
)

export const selectIsSupervisor = createSelector(
  selectAuthState,
  (auth) => auth.user?.role === 'EmployeeSupervisor'
)

export const selectIsSupervisorOrAdmin = createSelector(
  selectAuthState,
  (auth) => auth.user?.role === 'EmployeeSupervisor' || auth.user?.role === 'EmployeeAdmin'
)

export const selectHasPermission = (state: RootState, permission: string): boolean => {
  if (state.auth.user?.role === 'EmployeeAdmin') return true
  const permissions = state.auth.user?.permissions ?? []
  return permissions.some((p) => permissionMatches(p, permission))
}

export const selectCurrentUser = createSelector(selectAuthState, (auth) => auth.user)

export const selectUserType = createSelector(selectAuthState, (auth) => auth.userType)
