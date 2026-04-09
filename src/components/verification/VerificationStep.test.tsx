import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { VerificationStep } from '@/components/verification/VerificationStep'

jest.mock('@/lib/api/verification', () => ({
  getChallengeStatus: jest.fn(),
}))

describe('VerificationStep', () => {
  const defaultProps = {
    challengeId: null as number | null,
    onStatusVerified: jest.fn(),
    onVerified: jest.fn(),
    onBack: jest.fn(),
    loading: false,
    error: null as string | null,
    codeRequested: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders waiting message when code not yet requested', () => {
    renderWithProviders(<VerificationStep {...defaultProps} />)
    expect(screen.getByText(/waiting for verification/i)).toBeInTheDocument()
  })

  it('renders code input when code has been requested', () => {
    renderWithProviders(<VerificationStep {...defaultProps} codeRequested />)
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
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

  it('shows polling indicator when challenge is active', () => {
    renderWithProviders(<VerificationStep {...defaultProps} challengeId={123} codeRequested />)
    expect(screen.getByText(/waiting for mobile app/i)).toBeInTheDocument()
  })
})
