import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OrderTable } from '@/components/orders/OrderTable'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

const mockOrders = [
  createMockOrder({
    id: 1,
    ticker: 'AAPL',
    security_name: 'Apple Inc.',
    direction: 'buy',
    order_type: 'market',
    quantity: 10,
    status: 'pending',
  }),
  createMockOrder({
    id: 2,
    ticker: 'MSFT',
    security_name: 'Microsoft',
    direction: 'sell',
    order_type: 'limit',
    quantity: 5,
    status: 'filled',
  }),
]

describe('OrderTable', () => {
  const defaultProps = {
    orders: mockOrders,
    onCancel: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<OrderTable {...defaultProps} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Direction')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders order rows', () => {
    renderWithProviders(<OrderTable {...defaultProps} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('shows Cancel button only for pending orders', () => {
    renderWithProviders(<OrderTable {...defaultProps} />)
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
    expect(cancelButtons).toHaveLength(1)
  })

  it('calls onCancel when Cancel is clicked', () => {
    renderWithProviders(<OrderTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(defaultProps.onCancel).toHaveBeenCalledWith(1)
  })

  it('renders approve/decline buttons when provided', () => {
    renderWithProviders(
      <OrderTable {...defaultProps} onApprove={jest.fn()} onDecline={jest.fn()} />
    )
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
  })
})
