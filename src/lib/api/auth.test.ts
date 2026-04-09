import { apiClient } from '@/lib/api/axios'
import { login, logout, requestPasswordReset, resetPassword, activateAccount } from '@/lib/api/auth'
import type { PasswordResetPayload, AccountActivationPayload } from '@/types/auth'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { post: jest.fn() },
}))

const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('login', () => {
  it('posts credentials and returns tokens', async () => {
    const tokens = { access_token: 'at', refresh_token: 'rt' }
    mockPost.mockResolvedValue({ data: tokens })

    const result = await login({ email: 'a@b.com', password: 'pass' })

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'a@b.com',
      password: 'pass',
    })
    expect(result).toEqual(tokens)
  })
})

describe('logout', () => {
  it('posts refresh token', async () => {
    mockPost.mockResolvedValue({ data: { message: 'logged out successfully' } })

    await logout('rt')

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/logout', { refresh_token: 'rt' })
  })
})

describe('requestPasswordReset', () => {
  it('posts email', async () => {
    mockPost.mockResolvedValue({ data: { message: 'ok' } })

    await requestPasswordReset('a@b.com')

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/password/reset-request', {
      email: 'a@b.com',
    })
  })
})

describe('resetPassword', () => {
  it('posts reset payload', async () => {
    const payload: PasswordResetPayload = {
      token: 'tok',
      new_password: 'New12345',
      confirm_password: 'New12345',
    }
    mockPost.mockResolvedValue({ data: { message: 'ok' } })

    await resetPassword(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/password/reset', payload)
  })
})

describe('activateAccount', () => {
  it('posts activation payload', async () => {
    const payload: AccountActivationPayload = {
      token: 'tok',
      password: 'New12345',
      confirm_password: 'New12345',
    }
    mockPost.mockResolvedValue({ data: { message: 'ok' } })

    await activateAccount(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/activate', payload)
  })
})
