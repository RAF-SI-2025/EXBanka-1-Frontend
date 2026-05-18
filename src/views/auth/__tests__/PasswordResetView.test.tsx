import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PasswordResetView } from '@/views/auth/PasswordResetView'
import * as authApi from '@/lib/api/auth'

jest.mock('@/lib/api/auth')

beforeEach(() => jest.clearAllMocks())

describe('PasswordResetView', () => {
  it('reads token from URL path parameter', async () => {
    jest.mocked(authApi.resetPassword).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetView />, {
      route: '/password-reset/my-path-token',
      routePath: '/password-reset/:token',
    })

    await userEvent.type(screen.getByLabelText(/new password/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(authApi.resetPassword).toHaveBeenCalledWith({
        token: 'my-path-token',
        new_password: 'Password12',
        confirm_password: 'Password12',
      })
    })
  })

  it('calls resetPassword API with token from URL', async () => {
    jest.mocked(authApi.resetPassword).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetView />, { route: '/password-reset?token=my-token' })

    await userEvent.type(screen.getByLabelText(/new password/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(authApi.resetPassword).toHaveBeenCalledWith({
        token: 'my-token',
        new_password: 'Password12',
        confirm_password: 'Password12',
      })
    })
  })

  it('shows success message after reset', async () => {
    jest.mocked(authApi.resetPassword).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetView />, { route: '/password-reset?token=tok' })

    await userEvent.type(screen.getByLabelText(/new password/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await screen.findByText(/password reset successfully/i)
  })

  // The backend email template uses the /reset-password?token=... URL shape.
  // Cover both the query-string and the path-param variants of that alias so
  // we don't fall through to the catch-all <Route path="*"> redirect to /login.
  it('reads token from /reset-password?token=... alias (query param)', async () => {
    jest.mocked(authApi.resetPassword).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetView />, { route: '/reset-password?token=alias-token' })

    await userEvent.type(screen.getByLabelText(/new password/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(authApi.resetPassword).toHaveBeenCalledWith({
        token: 'alias-token',
        new_password: 'Password12',
        confirm_password: 'Password12',
      })
    })
  })

  it('reads token from /reset-password/:token alias (path param)', async () => {
    jest.mocked(authApi.resetPassword).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetView />, {
      route: '/reset-password/alias-path-token',
      routePath: '/reset-password/:token',
    })

    await userEvent.type(screen.getByLabelText(/new password/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(authApi.resetPassword).toHaveBeenCalledWith({
        token: 'alias-path-token',
        new_password: 'Password12',
        confirm_password: 'Password12',
      })
    })
  })
})
