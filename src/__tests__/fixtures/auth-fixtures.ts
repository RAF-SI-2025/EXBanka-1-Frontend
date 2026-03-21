import type { AuthUser } from '@/types/auth'

export function createMockAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: 'admin@test.com',
    role: 'EmployeeAdmin',
    permissions: ['employees.read', 'employees.create', 'employees.update'],
    ...overrides,
  }
}

export function createMockAuthState(
  overrides: Partial<{
    user: AuthUser | null
    userType: 'client' | 'employee' | null
    accessToken: string | null
    refreshToken: string | null
    status: 'idle' | 'loading' | 'authenticated' | 'error'
    error: string | null
  }> = {}
) {
  return {
    user: createMockAuthUser(),
    userType: 'employee' as const,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    status: 'authenticated' as const,
    error: null,
    ...overrides,
  }
}
