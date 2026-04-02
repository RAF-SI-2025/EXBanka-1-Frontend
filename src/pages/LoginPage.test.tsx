import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoginPage } from '@/pages/LoginPage'
import * as authApi from '@/lib/api/auth'
import * as jwt from '@/lib/utils/jwt'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/auth')
jest.mock('@/lib/utils/jwt')

beforeEach(() => jest.clearAllMocks())

describe('LoginPage', () => {
  it('renders the login form', () => {
    renderWithProviders(<LoginPage />, { route: '/login' })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('dispatches login on form submit', async () => {
    const tokens = { access_token: 'at', refresh_token: 'rt' }
    const user = { id: 1, email: 'a@b.com', role: 'EmployeeAdmin', permissions: [] }
    jest.mocked(authApi.login).mockResolvedValue(tokens)
    jest.mocked(jwt.decodeAuthToken).mockReturnValue(user)

    renderWithProviders(<LoginPage />, { route: '/login' })

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'Password12' })
    })
  })

  it('redirects to /employees if already authenticated', () => {
    renderWithProviders(<LoginPage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/login',
    })
    // LoginPage should redirect — form should NOT be rendered
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
  })
})
