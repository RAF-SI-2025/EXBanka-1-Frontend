import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminOrdersPage } from '@/pages/AdminOrdersPage'
import * as ordersApi from '@/lib/api/orders'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

jest.mock('@/lib/api/orders')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(ordersApi.getAllOrders).mockResolvedValue({
    orders: [createMockOrder({ id: 1, ticker: 'AAPL', status: 'pending' })],
    total_count: 1,
  })
  jest.mocked(ordersApi.approveOrder).mockResolvedValue(createMockOrder({ status: 'approved' }))
  jest.mocked(ordersApi.declineOrder).mockResolvedValue(createMockOrder({ status: 'declined' }))
})

describe('AdminOrdersPage', () => {
  it('renders page title', () => {
    renderWithProviders(<AdminOrdersPage />)
    expect(screen.getByText('Order Approval')).toBeInTheDocument()
  })

  it('displays orders on load', async () => {
    renderWithProviders(<AdminOrdersPage />)
    await screen.findByText('AAPL')
  })

  it('shows loading state', () => {
    jest.mocked(ordersApi.getAllOrders).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<AdminOrdersPage />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    jest.mocked(ordersApi.getAllOrders).mockResolvedValue({ orders: [], total_count: 0 })
    renderWithProviders(<AdminOrdersPage />)
    await screen.findByText('No orders found.')
  })

  it('calls approveOrder when Approve is clicked', async () => {
    renderWithProviders(<AdminOrdersPage />)
    await screen.findByText('AAPL')
    fireEvent.click(screen.getByRole('button', { name: /approve/i }))
    await waitFor(() => expect(ordersApi.approveOrder).toHaveBeenCalledWith(1))
  })

  it('calls declineOrder when Decline is clicked', async () => {
    renderWithProviders(<AdminOrdersPage />)
    await screen.findByText('AAPL')
    fireEvent.click(screen.getByRole('button', { name: /decline/i }))
    await waitFor(() => expect(ordersApi.declineOrder).toHaveBeenCalledWith(1))
  })
})
