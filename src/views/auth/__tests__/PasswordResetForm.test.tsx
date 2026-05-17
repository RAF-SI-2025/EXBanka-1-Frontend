import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PasswordResetForm } from '@/views/auth/components/PasswordResetForm'

const mockOnSubmit = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('PasswordResetForm', () => {
  it('renders new_password and confirm_password fields', () => {
    renderWithProviders(<PasswordResetForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('validates password requirements', async () => {
    renderWithProviders(<PasswordResetForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/new password/i), 'weak')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'weak')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() => {
      // Should show a password validation error
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates password match', async () => {
    renderWithProviders(<PasswordResetForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/new password/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password99')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with valid data', async () => {
    renderWithProviders(<PasswordResetForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/new password/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        new_password: 'Password12',
        confirm_password: 'Password12',
      })
    })
  })

  it('shows success message', () => {
    renderWithProviders(
      <PasswordResetForm onSubmit={mockOnSubmit} isLoading={false} isSuccess={true} />
    )
    expect(screen.getByText(/password reset successfully/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })
})
