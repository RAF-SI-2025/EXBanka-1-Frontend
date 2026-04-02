import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BuyOtcDialog } from '@/components/otc/BuyOtcDialog'
import { createMockOtcOffer } from '@/__tests__/fixtures/otc-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

describe('BuyOtcDialog', () => {
  const offer = createMockOtcOffer({ ticker: 'AAPL', quantity: 5, price: '175.00' })
  const accounts = [
    createMockAccount({ id: 1, account_name: 'Main Account', currency_code: 'USD' }),
  ]
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    offer,
    accounts,
    onSubmit: jest.fn(),
    loading: false,
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders dialog title with ticker', () => {
    render(<BuyOtcDialog {...defaultProps} />)
    expect(screen.getByText(/buy aapl/i)).toBeInTheDocument()
  })

  it('shows available quantity and price', () => {
    render(<BuyOtcDialog {...defaultProps} />)
    expect(screen.getByText(/available/i)).toBeInTheDocument()
    expect(screen.getByText('175.00')).toBeInTheDocument()
  })

  it('calls onSubmit with quantity and account_id', async () => {
    render(<BuyOtcDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /^buy$/i }))
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({ quantity: 3, account_id: 1 })
    })
  })

  it('disables submit when quantity exceeds offer quantity', () => {
    render(<BuyOtcDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '99' } })
    expect(screen.getByRole('button', { name: /^buy$/i })).toBeDisabled()
  })

  it('disables submit when loading', () => {
    render(<BuyOtcDialog {...defaultProps} loading={true} />)
    expect(screen.getByRole('button', { name: /buying/i })).toBeDisabled()
  })
})
