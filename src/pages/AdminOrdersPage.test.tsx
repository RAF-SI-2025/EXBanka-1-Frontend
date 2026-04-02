import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminOrdersPage } from '@/pages/AdminOrdersPage'
import * as useOrdersHook from '@/hooks/useOrders'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

jest.mock('@/hooks/useOrders')

describe('AdminOrdersPage', () => {
  const orders = [
    createMockOrder({ id: 1, asset_ticker: 'AAPL', status: 'pending' }),
    createMockOrder({ id: 2, asset_ticker: 'MSFT', status: 'approved' }),
  ]
  const approveFn = jest.fn()
  const declineFn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .mocked(useOrdersHook.useAllOrders)
      .mockReturnValue({ data: { orders, total_count: 2 }, isLoading: false } as any)
    jest
      .mocked(useOrdersHook.useApproveOrder)
      .mockReturnValue({ mutate: approveFn, isPending: false } as any)
    jest
      .mocked(useOrdersHook.useDeclineOrder)
      .mockReturnValue({ mutate: declineFn, isPending: false } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminOrdersPage />)
    expect(screen.getByText(/order review/i)).toBeInTheDocument()
  })

  it('renders orders in the table', () => {
    renderWithProviders(<AdminOrdersPage />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest
      .mocked(useOrdersHook.useAllOrders)
      .mockReturnValue({ data: undefined, isLoading: true } as any)
    renderWithProviders(<AdminOrdersPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('calls approve when Approve is clicked', () => {
    renderWithProviders(<AdminOrdersPage />)
    fireEvent.click(screen.getAllByRole('button', { name: /approve/i })[0])
    expect(approveFn).toHaveBeenCalledWith(1)
  })

  it('calls decline when Decline is clicked', () => {
    renderWithProviders(<AdminOrdersPage />)
    fireEvent.click(screen.getAllByRole('button', { name: /decline/i })[0])
    expect(declineFn).toHaveBeenCalledWith(1)
  })
})
