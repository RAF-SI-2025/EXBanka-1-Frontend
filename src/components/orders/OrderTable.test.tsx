import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OrderTable } from '@/components/orders/OrderTable'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

const pendingOrder = createMockOrder({
  id: 1,
  ticker: 'AAPL',
  security_name: 'Apple Inc.',
  direction: 'buy',
  order_type: 'market',
  quantity: 10,
  status: 'pending',
  state: 'pending',
  filled_quantity: 0,
  is_done: false,
})

const filledOrder = createMockOrder({
  id: 2,
  ticker: 'MSFT',
  security_name: 'Microsoft',
  direction: 'sell',
  order_type: 'limit',
  quantity: 5,
  status: 'filled',
  state: 'filled',
  filled_quantity: 5,
  is_done: true,
})

const approvedOrder = createMockOrder({
  id: 3,
  ticker: 'TSLA',
  security_name: 'Tesla',
  direction: 'buy',
  order_type: 'market',
  quantity: 8,
  status: 'approved',
  state: 'approved',
  filled_quantity: 3,
  is_done: false,
})

describe('OrderTable', () => {
  const defaultProps = {
    orders: [pendingOrder, filledOrder],
    onCancel: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers including Filled', () => {
    renderWithProviders(<OrderTable {...defaultProps} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Direction')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Filled' })).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders order rows', () => {
    renderWithProviders(<OrderTable {...defaultProps} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('shows filled_quantity in the Filled column', () => {
    renderWithProviders(<OrderTable orders={[approvedOrder]} onCancel={jest.fn()} />)
    expect(screen.getByText('3 / 8')).toBeInTheDocument()
  })

  it('shows Cancel only for orders that are not done and not filled', () => {
    renderWithProviders(<OrderTable {...defaultProps} />)
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
    expect(cancelButtons).toHaveLength(1)
  })

  it('shows Cancel for approved (not done, not filled) order', () => {
    renderWithProviders(<OrderTable orders={[approvedOrder]} onCancel={jest.fn()} />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('hides Cancel for filled order (is_done=true)', () => {
    renderWithProviders(<OrderTable orders={[filledOrder]} onCancel={jest.fn()} />)
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
  })

  it('calls onCancel with order id when Cancel clicked', () => {
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

  it('displays state in the Status column', () => {
    renderWithProviders(<OrderTable orders={[approvedOrder]} onCancel={jest.fn()} />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })
})
