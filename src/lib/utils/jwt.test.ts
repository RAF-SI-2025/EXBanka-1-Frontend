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
      user_id: 42,
      email: 'admin@bank.com',
      role: 'EmployeeAdmin',
      permissions: ['employees.read', 'employees.create'],
    })

    const user = decodeAuthToken(token)

    expect(user).toEqual({
      id: 42,
      email: 'admin@bank.com',
      role: 'EmployeeAdmin',
      permissions: ['employees.read', 'employees.create'],
    })
  })

  it('normalizes lowercase role to title case', () => {
    const token = createFakeJwt({
      user_id: 5,
      email: 'client@example.com',
      role: 'client',
      permissions: [],
    })

    const user = decodeAuthToken(token)

    expect(user?.role).toBe('Client')
  })

  it('does not throw and returns user when role is missing from JWT', () => {
    const token = createFakeJwt({
      user_id: 5,
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
})
