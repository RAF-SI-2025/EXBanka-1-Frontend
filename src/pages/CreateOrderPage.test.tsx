import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOrderPage } from '@/pages/CreateOrderPage'
import * as ordersApi from '@/lib/api/orders'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

jest.mock('@/lib/api/orders')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('listingId=42&direction=buy')],
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(ordersApi.createOrder).mockResolvedValue(createMockOrder())
})

describe('CreateOrderPage', () => {
  it('renders page title', () => {
    renderWithProviders(<CreateOrderPage />)
    expect(screen.getByText('Create Order')).toBeInTheDocument()
  })

  it('renders the order form', () => {
    renderWithProviders(<CreateOrderPage />)
    expect(screen.getByLabelText('Direction')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
  })

  it('submits the order and navigates to orders', async () => {
    renderWithProviders(<CreateOrderPage />)
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(ordersApi.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ listing_id: 42, direction: 'buy', quantity: 10 })
      )
    })
  })
})
