import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BuyOrderDialog } from '@/components/securities/BuyOrderDialog'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

describe('BuyOrderDialog', () => {
  const stock = createMockStock({ ask: '185.00', bid: '184.90' })
  const accounts = [
    createMockAccount({ id: 1, account_name: 'Main Account', currency_code: 'USD' }),
  ]
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    security: stock,
    accounts,
    onSubmit: jest.fn(),
    loading: false,
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders dialog title with ticker', () => {
    render(<BuyOrderDialog {...defaultProps} />)
    expect(screen.getByText(/buy aapl/i)).toBeInTheDocument()
  })

  it('renders quantity input', () => {
    render(<BuyOrderDialog {...defaultProps} />)
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it('renders account selector', () => {
    render(<BuyOrderDialog {...defaultProps} />)
    expect(screen.getByText(/account/i)).toBeInTheDocument()
  })

  it('shows approx price updated when quantity changes', () => {
    render(<BuyOrderDialog {...defaultProps} />)
    const quantityInput = screen.getByLabelText(/quantity/i)
    fireEvent.change(quantityInput, { target: { value: '2' } })
    // 2 * 1 (contract_size) * 185.00 (ask) = 370.00
    expect(screen.getByText(/370/)).toBeInTheDocument()
  })

  it('calls onSubmit with correct payload when form is submitted', async () => {
    render(<BuyOrderDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /place order/i }))
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          listing_id: stock.id,
          direction: 'buy',
          quantity: 5,
          order_type: 'market',
          account_id: 1,
        })
      )
    })
  })

  it('disables submit button when quantity is 0', () => {
    render(<BuyOrderDialog {...defaultProps} />)
    const quantityInput = screen.getByLabelText(/quantity/i)
    fireEvent.change(quantityInput, { target: { value: '0' } })
    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled()
  })

  it('disables submit when loading', () => {
    render(<BuyOrderDialog {...defaultProps} loading={true} />)
    expect(screen.getByRole('button', { name: /placing/i })).toBeDisabled()
  })
})
