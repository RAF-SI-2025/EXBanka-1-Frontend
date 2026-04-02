import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { MyOrdersPage } from '@/pages/MyOrdersPage'
import * as ordersApi from '@/lib/api/orders'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

jest.mock('@/lib/api/orders')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(ordersApi.getMyOrders).mockResolvedValue({
    orders: [createMockOrder({ id: 1, ticker: 'AAPL', status: 'pending' })],
    total_count: 1,
  })
  jest.mocked(ordersApi.cancelOrder).mockResolvedValue(createMockOrder({ status: 'cancelled' }))
})

describe('MyOrdersPage', () => {
  it('renders page title', () => {
    renderWithProviders(<MyOrdersPage />)
    expect(screen.getByText('My Orders')).toBeInTheDocument()
  })

  it('displays orders on load', async () => {
    renderWithProviders(<MyOrdersPage />)
    await screen.findByText('AAPL')
  })

  it('shows loading state', () => {
    jest.mocked(ordersApi.getMyOrders).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<MyOrdersPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    jest.mocked(ordersApi.getMyOrders).mockResolvedValue({ orders: [], total_count: 0 })
    renderWithProviders(<MyOrdersPage />)
    await screen.findByText('No orders found.')
  })

  it('calls cancelOrder when Cancel is clicked', async () => {
    renderWithProviders(<MyOrdersPage />)
    await screen.findByText('AAPL')
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => expect(ordersApi.cancelOrder).toHaveBeenCalledWith(1))
  })
})
