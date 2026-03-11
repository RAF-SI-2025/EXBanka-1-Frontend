import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ActivationPage } from '@/pages/ActivationPage'
import * as authApi from '@/lib/api/auth'

jest.mock('@/lib/api/auth')

beforeEach(() => jest.clearAllMocks())

describe('ActivationPage', () => {
  it('calls activateAccount API with token from URL', async () => {
    jest.mocked(authApi.activateAccount).mockResolvedValue(undefined)

    renderWithProviders(<ActivationPage />, { route: '/activate?token=my-token' })

    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /activate account/i }))

    await waitFor(() => {
      expect(authApi.activateAccount).toHaveBeenCalledWith({
        token: 'my-token',
        password: 'Password12',
        confirm_password: 'Password12',
      })
    })
  })

  it('shows success message after activation', async () => {
    jest.mocked(authApi.activateAccount).mockResolvedValue(undefined)

    renderWithProviders(<ActivationPage />, { route: '/activate?token=tok' })

    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /activate account/i }))

    await screen.findByText(/account activated successfully/i)
  })
})
