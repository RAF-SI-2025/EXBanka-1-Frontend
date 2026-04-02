import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { VerificationStep } from '@/components/verification/VerificationStep'

describe('VerificationStep', () => {
  const defaultProps = {
    onVerified: jest.fn(),
    onBack: jest.fn(),
    onRequestCode: jest.fn(),
    loading: false,
    error: null as string | null,
    codeRequested: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders request code button when code not yet requested', () => {
    renderWithProviders(<VerificationStep {...defaultProps} />)
    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument()
  })

  it('renders code input when code has been requested', () => {
    renderWithProviders(<VerificationStep {...defaultProps} codeRequested />)
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
  })

  it('calls onRequestCode when request button clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VerificationStep {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /send code/i }))
    expect(defaultProps.onRequestCode).toHaveBeenCalled()
  })

  it('calls onVerified with entered code', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VerificationStep {...defaultProps} codeRequested />)
    await user.type(screen.getByLabelText(/verification code/i), '847291')
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(defaultProps.onVerified).toHaveBeenCalledWith('847291')
  })

  it('shows error message when error prop is set', () => {
    renderWithProviders(<VerificationStep {...defaultProps} codeRequested error="Neispravan kod" />)
    expect(screen.getByText('Neispravan kod')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderWithProviders(<VerificationStep {...defaultProps} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })
})
