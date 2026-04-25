import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminOrdersPage } from '@/pages/AdminOrdersPage'
import * as ordersApi from '@/lib/api/orders'
import * as securitiesApi from '@/lib/api/securities'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/orders')
jest.mock('@/lib/api/securities')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(ordersApi.getAllOrders).mockResolvedValue({
    orders: [createMockOrder({ id: 1, ticker: 'AAPL', status: 'pending' })],
    total_count: 1,
  })
  jest.mocked(ordersApi.approveOrder).mockResolvedValue(createMockOrder({ status: 'approved' }))
  jest.mocked(ordersApi.declineOrder).mockResolvedValue(createMockOrder({ status: 'declined' }))
  jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks: [], total_count: 0 })
  jest.mocked(securitiesApi.getFutures).mockResolvedValue({ futures: [], total_count: 0 })
  jest.mocked(securitiesApi.getForexPairs).mockResolvedValue({ forex_pairs: [], total_count: 0 })
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

  it('shows ticker and security name from listing map when order fields are empty', async () => {
    const stock = createMockStock({
      id: 99,
      listing_id: 99,
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
    })
    jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks: [stock], total_count: 1 })
    jest.mocked(ordersApi.getAllOrders).mockResolvedValue({
      orders: [
        createMockOrder({
          id: 3,
          listing_id: 99,
          ticker: '',
          security_name: '',
          status: 'pending',
        }),
      ],
      total_count: 1,
    })
    renderWithProviders(<AdminOrdersPage />)
    await waitFor(() => expect(screen.getByText('MSFT')).toBeInTheDocument())
    expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument()
  })
})
