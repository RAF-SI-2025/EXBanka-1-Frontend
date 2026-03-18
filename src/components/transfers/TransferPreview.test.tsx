import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransferPreview } from '@/components/transfers/TransferPreview'

describe('TransferPreview', () => {
  const defaultProps = {
    clientName: 'Petar Petrović',
    fromAccount: '111000100000000011',
    toAccount: '111000100000000022',
    amount: 1300,
    fromCurrency: 'RSD',
    toCurrency: 'EUR',
    rate: 117.5,
    commission: 0.7,
    finalAmount: 10.37,
    onConfirm: jest.fn(),
    onBack: jest.fn(),
    submitting: false,
  }

  beforeEach(() => jest.clearAllMocks())

  it('displays transfer details', () => {
    renderWithProviders(<TransferPreview {...defaultProps} />)
    expect(screen.getByText('Petar Petrović')).toBeInTheDocument()
    expect(screen.getByText(/117.5/)).toBeInTheDocument()
    expect(screen.getByText(/0.7/)).toBeInTheDocument()
    expect(screen.getByText(/10.37/)).toBeInTheDocument()
  })

  it('calls onConfirm', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TransferPreview {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: 'Potvrdi' }))
    expect(defaultProps.onConfirm).toHaveBeenCalled()
  })

  it('calls onBack', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TransferPreview {...defaultProps} />)
    await user.click(screen.getByText(/nazad/i))
    expect(defaultProps.onBack).toHaveBeenCalled()
  })
})
