import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoginForm } from '@/views/auth/components/LoginForm'

const mockOnSubmit = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with valid credentials', async () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password12',
      })
    })
  })

  it('disables submit button when loading', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />)
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
  })

  it('displays error message when provided', () => {
    renderWithProviders(
      <LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Invalid credentials" />
    )
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('has a link to password reset', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute(
      'href',
      '/password-reset-request'
    )
  })

  it('clicking the "Log In" title submits with admin credentials and fills the inputs', async () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.click(screen.getByTestId('auth-form-title-secret'))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'admin+testadmin@admin.com',
        password: 'AdminAdmin2026!.',
      })
    })
    expect(screen.getByLabelText(/email/i)).toHaveValue('admin+testadmin@admin.com')
    expect(screen.getByLabelText(/password/i)).toHaveValue('AdminAdmin2026!.')
  })
})
