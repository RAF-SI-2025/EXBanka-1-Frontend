import { render, screen, fireEvent } from '@testing-library/react'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

describe('OrdersTable', () => {
  const orders = [
    createMockOrder({ id: 1, ticker: 'AAPL', direction: 'buy', status: 'pending' }),
    createMockOrder({ id: 2, ticker: 'MSFT', direction: 'sell', status: 'approved' }),
  ]

  it('renders table headers', () => {
    render(<OrdersTable orders={orders} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Direction')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders each order row', () => {
    render(<OrdersTable orders={orders} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('renders empty state when no orders', () => {
    render(<OrdersTable orders={[]} />)
    expect(screen.getByText(/no orders/i)).toBeInTheDocument()
  })

  it('renders approve and decline buttons when callbacks provided', () => {
    render(<OrdersTable orders={[orders[0]]} onApprove={jest.fn()} onDecline={jest.fn()} />)
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
  })

  it('calls onApprove with order id when Approve is clicked', () => {
    const onApprove = jest.fn()
    render(<OrdersTable orders={[orders[0]]} onApprove={onApprove} onDecline={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /approve/i }))
    expect(onApprove).toHaveBeenCalledWith(orders[0].id)
  })

  it('calls onDecline with order id when Decline is clicked', () => {
    const onDecline = jest.fn()
    render(<OrdersTable orders={[orders[0]]} onApprove={jest.fn()} onDecline={onDecline} />)
    fireEvent.click(screen.getByRole('button', { name: /decline/i }))
    expect(onDecline).toHaveBeenCalledWith(orders[0].id)
  })

  it('does not render action buttons when no callbacks provided', () => {
    render(<OrdersTable orders={orders} />)
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
  })
})
