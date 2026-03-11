import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ActivationForm } from '@/components/auth/ActivationForm'

const mockOnSubmit = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('ActivationForm', () => {
  it('renders password and confirm_password fields', () => {
    renderWithProviders(<ActivationForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /activate account/i })).toBeInTheDocument()
  })

  it('validates password match', async () => {
    renderWithProviders(<ActivationForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'DifferentPass12')
    await userEvent.click(screen.getByRole('button', { name: /activate account/i }))
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with valid data', async () => {
    renderWithProviders(<ActivationForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password12')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /activate account/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        password: 'Password12',
        confirm_password: 'Password12',
      })
    })
  })

  it('shows success message', () => {
    renderWithProviders(
      <ActivationForm onSubmit={mockOnSubmit} isLoading={false} isSuccess={true} />
    )
    expect(screen.getByText(/account activated successfully/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })
})
