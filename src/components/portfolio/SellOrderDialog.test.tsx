import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SellOrderDialog } from '@/components/portfolio/SellOrderDialog'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

describe('SellOrderDialog', () => {
  const holding = createMockHolding({ bid: '175.40', contract_size: 1, quantity: 10 })
  const accounts = [
    createMockAccount({ id: 1, account_name: 'Main Account', currency_code: 'USD' }),
  ]
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    holding,
    accounts,
    onSubmit: jest.fn(),
    loading: false,
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders dialog title with ticker', () => {
    render(<SellOrderDialog {...defaultProps} />)
    expect(screen.getByText(/sell aapl/i)).toBeInTheDocument()
  })

  it('renders quantity input', () => {
    render(<SellOrderDialog {...defaultProps} />)
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it('shows approx price when quantity changes', () => {
    render(<SellOrderDialog {...defaultProps} />)
    const quantityInput = screen.getByLabelText(/quantity/i)
    fireEvent.change(quantityInput, { target: { value: '2' } })
    // 2 * 1 (contract_size) * 175.40 (bid) = 350.80
    expect(screen.getByText(/350/)).toBeInTheDocument()
  })

  it('calls onSubmit with correct payload', async () => {
    render(<SellOrderDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /place order/i }))
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          holding_id: holding.id,
          direction: 'sell',
          quantity: 3,
          order_type: 'market',
          account_id: 1,
        })
      )
    })
  })

  it('disables submit when quantity exceeds holding quantity', () => {
    render(<SellOrderDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '99' } })
    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled()
  })

  it('disables submit when loading', () => {
    render(<SellOrderDialog {...defaultProps} loading={true} />)
    expect(screen.getByRole('button', { name: /placing/i })).toBeDisabled()
  })
})
