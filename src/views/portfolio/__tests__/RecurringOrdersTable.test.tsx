import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { RecurringOrdersTable } from '@/views/portfolio/components/RecurringOrdersTable'
import type { RecurringOrder } from '@/types/recurringOrder'

function makeOrder(overrides: Partial<RecurringOrder> = {}): RecurringOrder {
  return {
    id: 1,
    listing_id: 7,
    side: 'buy',
    quantity: 10,
    account_id: 42,
    interval: 'monthly',
    day_of_month: 15,
    start_date_unix: 1731699200,
    end_date_unix: 0,
    status: 'active',
    created_at: '2026-05-30T00:00:00Z',
    updated_at: '2026-05-30T00:00:00Z',
    ...overrides,
  }
}

const noop = () => {}

describe('RecurringOrdersTable', () => {
  it('shows an empty-state message when there are no orders', () => {
    renderWithProviders(
      <RecurringOrdersTable orders={[]} onPause={noop} onResume={noop} onCancel={noop} />
    )
    expect(screen.getByText(/no recurring orders/i)).toBeInTheDocument()
  })

  it('renders an active order with Pause and Cancel actions', () => {
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ status: 'active' })]}
        onPause={noop}
        onResume={noop}
        onCancel={noop}
      />
    )
    expect(screen.getByRole('button', { name: /^pause$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^resume$/i })).not.toBeInTheDocument()
  })

  it('renders a paused order with Resume and Cancel actions', () => {
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ status: 'paused' })]}
        onPause={noop}
        onResume={noop}
        onCancel={noop}
      />
    )
    expect(screen.getByRole('button', { name: /^resume$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^pause$/i })).not.toBeInTheDocument()
  })

  it('renders a cancelled order with no action buttons', () => {
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ status: 'cancelled' })]}
        onPause={noop}
        onResume={noop}
        onCancel={noop}
      />
    )
    expect(screen.queryByRole('button', { name: /^pause$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^resume$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument()
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument()
  })

  it('calls onPause with the order id when Pause is clicked', () => {
    const onPause = jest.fn()
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ id: 99, status: 'active' })]}
        onPause={onPause}
        onResume={noop}
        onCancel={noop}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /^pause$/i }))
    expect(onPause).toHaveBeenCalledWith(99)
  })

  it('opens the confirmation dialog and calls onCancel only after confirming', () => {
    const onCancel = jest.fn()
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ id: 5, status: 'active' })]}
        onPause={noop}
        onResume={noop}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onCancel).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /cancel order/i }))
    expect(onCancel).toHaveBeenCalledWith(5)
  })

  it('disables the row actions while busyId matches', () => {
    renderWithProviders(
      <RecurringOrdersTable
        orders={[makeOrder({ id: 7, status: 'active' })]}
        onPause={noop}
        onResume={noop}
        onCancel={noop}
        busyId={7}
      />
    )
    expect(screen.getByRole('button', { name: /^pause$/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled()
  })
})
