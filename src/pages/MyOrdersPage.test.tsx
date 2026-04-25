import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { MyOrdersPage } from '@/pages/MyOrdersPage'
import * as ordersApi from '@/lib/api/orders'
import * as securitiesApi from '@/lib/api/securities'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/orders')
jest.mock('@/lib/api/securities')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(ordersApi.getMyOrders).mockResolvedValue({
    orders: [createMockOrder({ id: 1, ticker: 'AAPL', status: 'pending' })],
    total_count: 1,
  })
  jest.mocked(ordersApi.cancelOrder).mockResolvedValue(createMockOrder({ status: 'cancelled' }))
  jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks: [], total_count: 0 })
  jest.mocked(securitiesApi.getFutures).mockResolvedValue({ futures: [], total_count: 0 })
  jest.mocked(securitiesApi.getForexPairs).mockResolvedValue({ forex_pairs: [], total_count: 0 })
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

  it('shows ticker and security name from listing map when order fields are empty', async () => {
    const stock = createMockStock({ id: 42, listing_id: 42, ticker: 'TSLA', name: 'Tesla Inc.' })
    jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks: [stock], total_count: 1 })
    jest.mocked(ordersApi.getMyOrders).mockResolvedValue({
      orders: [
        createMockOrder({
          id: 2,
          listing_id: 42,
          ticker: '',
          security_name: '',
          status: 'pending',
        }),
      ],
      total_count: 1,
    })
    renderWithProviders(<MyOrdersPage />)
    await waitFor(() => expect(screen.getByText('TSLA')).toBeInTheDocument())
    expect(screen.getByText('Tesla Inc.')).toBeInTheDocument()
  })
})
