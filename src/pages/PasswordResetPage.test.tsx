import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PasswordResetPage } from '@/pages/PasswordResetPage'
import * as authApi from '@/lib/api/auth'

jest.mock('@/lib/api/auth')

beforeEach(() => jest.clearAllMocks())

describe('PasswordResetPage', () => {
  it('reads token from URL path parameter', async () => {
    jest.mocked(authApi.resetPassword).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetPage />, {
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

    renderWithProviders(<PasswordResetPage />, { route: '/password-reset?token=my-token' })

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

    renderWithProviders(<PasswordResetPage />, { route: '/password-reset?token=tok' })

    await userEvent.type(screen.getByLabelText(/new password/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await screen.findByText(/password reset successfully/i)
  })
})
