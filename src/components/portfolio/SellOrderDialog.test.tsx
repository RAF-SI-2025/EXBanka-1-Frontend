import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SellOrderDialog } from '@/components/portfolio/SellOrderDialog'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

describe('SellOrderDialog', () => {
  const holding = createMockHolding({ quantity: 10 })
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

  it('shows order type information', () => {
    render(<SellOrderDialog {...defaultProps} />)
    expect(screen.getByText(/order type/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct payload', async () => {
    render(<SellOrderDialog {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /place order/i }))
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
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
