import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PasswordResetRequestPage } from '@/pages/PasswordResetRequestPage'
import * as authApi from '@/lib/api/auth'

jest.mock('@/lib/api/auth')

beforeEach(() => jest.clearAllMocks())

describe('PasswordResetRequestPage', () => {
  it('calls requestPasswordReset API on submit', async () => {
    jest.mocked(authApi.requestPasswordReset).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetRequestPage />, { route: '/password-reset-request' })

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(authApi.requestPasswordReset).toHaveBeenCalledWith('user@test.com')
    })
  })

  it('shows success message after submit', async () => {
    jest.mocked(authApi.requestPasswordReset).mockResolvedValue(undefined)

    renderWithProviders(<PasswordResetRequestPage />, { route: '/password-reset-request' })

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await screen.findByText(/reset link has been sent/i)
  })
})
