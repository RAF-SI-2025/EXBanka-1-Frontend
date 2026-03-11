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

  it('returns null for invalid token', () => {
    expect(decodeAuthToken('not-a-jwt')).toBeNull()
  })
})
