import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm'

const mockOnSubmit = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('PasswordResetRequestForm', () => {
  it('renders email field and submit button', () => {
    renderWithProviders(<PasswordResetRequestForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('validates email', async () => {
    renderWithProviders(<PasswordResetRequestForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'not-email')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('calls onSubmit with valid email', async () => {
    renderWithProviders(<PasswordResetRequestForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('user@test.com')
    })
  })

  it('shows success message', () => {
    renderWithProviders(
      <PasswordResetRequestForm onSubmit={mockOnSubmit} isLoading={false} isSuccess={true} />
    )
    expect(screen.getByText(/reset link has been sent/i)).toBeInTheDocument()
  })
})
