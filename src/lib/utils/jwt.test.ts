import { decodeAuthToken } from '@/lib/utils/jwt'

function createFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'fake-signature'
  return `${header}.${body}.${signature}`
}

describe('decodeAuthToken', () => {
  it('extracts user info from JWT payload', () => {
    const token = createFakeJwt({
      principal_id: 42,
      email: 'admin@bank.com',
      roles: ['EmployeeAdmin'],
      permissions: ['employees.read', 'employees.create'],
    })

    const user = decodeAuthToken(token)

    expect(user).toEqual({
      id: 42,
      email: 'admin@bank.com',
      role: 'EmployeeAdmin',
      permissions: ['employees.read', 'employees.create'],
      system_type: null,
    })
  })

  it('normalizes lowercase role to title case', () => {
    const token = createFakeJwt({
      principal_id: 5,
      email: 'client@example.com',
      roles: ['client'],
      permissions: [],
    })

    const user = decodeAuthToken(token)

    expect(user?.role).toBe('Client')
  })

  it('does not throw and returns user when roles are missing from JWT', () => {
    const token = createFakeJwt({
      principal_id: 5,
      email: 'client@example.com',
      permissions: [],
    })

    expect(() => decodeAuthToken(token)).not.toThrow()
    const user = decodeAuthToken(token)
    expect(user).not.toBeNull()
    expect(user?.role).toBe('')
  })

  it('returns null for invalid token', () => {
    expect(decodeAuthToken('not-a-jwt')).toBeNull()
  })

  it('decodes principal_type "employee" as system_type', () => {
    const token = createFakeJwt({
      principal_id: 1,
      email: 'admin@test.com',
      roles: ['EmployeeAdmin'],
      principal_type: 'employee',
      permissions: ['employees.read'],
    })
    const result = decodeAuthToken(token)
    expect(result?.system_type).toBe('employee')
  })

  it('decodes principal_type "client" as system_type', () => {
    const token = createFakeJwt({
      principal_id: 2,
      email: 'client@test.com',
      roles: ['client'],
      principal_type: 'client',
      permissions: [],
    })
    const result = decodeAuthToken(token)
    expect(result?.system_type).toBe('client')
  })

  it('defaults system_type to null when principal_type is missing', () => {
    const token = createFakeJwt({
      principal_id: 1,
      email: 'admin@test.com',
      roles: ['EmployeeAdmin'],
      permissions: [],
    })
    const result = decodeAuthToken(token)
    expect(result?.system_type).toBeNull()
  })
})
