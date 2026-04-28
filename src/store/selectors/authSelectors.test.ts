import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectHasPermission,
  selectUserType,
} from '@/store/selectors/authSelectors'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'
import type { RootState } from '@/store'

function mockRootState(authOverrides = {}): RootState {
  return { auth: createMockAuthState(authOverrides) } as RootState
}

describe('authSelectors', () => {
  it('selectIsAuthenticated returns true when authenticated', () => {
    expect(selectIsAuthenticated(mockRootState())).toBe(true)
  })

  it('selectIsAuthenticated returns false when idle', () => {
    expect(selectIsAuthenticated(mockRootState({ status: 'idle' }))).toBe(false)
  })

  it('selectIsAdmin returns true when role is EmployeeAdmin', () => {
    const state = mockRootState({
      user: createMockAuthUser({ role: 'EmployeeAdmin' }),
    })
    expect(selectIsAdmin(state)).toBe(true)
  })

  it('selectIsAdmin returns false for non-admin employee roles', () => {
    const state = mockRootState({
      user: createMockAuthUser({ role: 'EmployeeBasic' }),
    })
    expect(selectIsAdmin(state)).toBe(false)
  })

  it('selectIsAdmin returns false when user is null', () => {
    const state = mockRootState({ user: null })
    expect(selectIsAdmin(state)).toBe(false)
  })

  it('selectUserType returns the userType from state', () => {
    expect(selectUserType(mockRootState({ userType: 'employee' }))).toBe('employee')
    expect(selectUserType(mockRootState({ userType: 'client' }))).toBe('client')
    expect(selectUserType(mockRootState({ userType: null }))).toBeNull()
  })

  it('selectHasPermission checks for a specific permission', () => {
    const state = mockRootState()
    expect(selectHasPermission(state, 'employees.read')).toBe(true)
    expect(selectHasPermission(state, 'nonexistent')).toBe(false)
  })
})
