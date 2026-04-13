import { apiClient } from '@/lib/api/axios'
import {
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelOrder,
  getAllOrders,
  approveOrder,
  declineOrder,
} from '@/lib/api/orders'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
beforeEach(() => jest.clearAllMocks())

describe('createOrder', () => {
  it('posts order payload', async () => {
    const order = createMockOrder()
    mockPost.mockResolvedValue({ data: order })
    const payload = {
      listing_id: 42,
      direction: 'buy' as const,
      order_type: 'market' as const,
      quantity: 10,
    }
    const result = await createOrder(payload)
    expect(mockPost).toHaveBeenCalledWith('/api/v1/me/orders', payload)
    expect(result).toEqual(order)
  })
})

describe('getMyOrders', () => {
  it('fetches with filters', async () => {
    const response = { orders: [createMockOrder()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getMyOrders({ status: 'pending', page: 1, page_size: 10 })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/me/orders', {
      params: { status: 'pending', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches with no filters', async () => {
    const response = { orders: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getMyOrders()
    expect(mockGet).toHaveBeenCalledWith('/api/v1/me/orders', { params: {} })
    expect(result).toEqual(response)
  })

  it('flattens nested listing object and maps name to security_name', async () => {
    const rawOrder = {
      id: 1,
      listing_id: 42,
      listing: { id: 42, ticker: 'AAPL', name: 'Apple Inc.' },
      direction: 'buy',
      order_type: 'market',
      quantity: 10,
      status: 'pending',
      limit_value: null,
      stop_value: null,
      all_or_none: false,
      margin: false,
      account_id: 1,
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-01T10:00:00Z',
    }
    mockGet.mockResolvedValue({ data: { orders: [rawOrder], total_count: 1 } })
    const result = await getMyOrders()
    expect(result.orders[0].ticker).toBe('AAPL')
    expect(result.orders[0].security_name).toBe('Apple Inc.')
  })
})

describe('getMyOrder', () => {
  it('fetches by ID', async () => {
    const order = createMockOrder()
    mockGet.mockResolvedValue({ data: order })
    const result = await getMyOrder(1)
    expect(mockGet).toHaveBeenCalledWith('/api/v1/me/orders/1')
    expect(result).toEqual(order)
  })
})

describe('cancelOrder', () => {
  it('posts cancel', async () => {
    const order = createMockOrder({ status: 'cancelled' })
    mockPost.mockResolvedValue({ data: order })
    const result = await cancelOrder(1)
    expect(mockPost).toHaveBeenCalledWith('/api/v1/me/orders/1/cancel')
    expect(result).toEqual(order)
  })
})

describe('getAllOrders', () => {
  it('fetches all orders with filters', async () => {
    const response = { orders: [createMockOrder()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getAllOrders({ status: 'pending' })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/orders', { params: { status: 'pending' } })
    expect(result).toEqual(response)
  })

  it('flattens nested listing object and maps name to security_name', async () => {
    const rawOrder = {
      id: 2,
      listing_id: 7,
      listing: { id: 7, ticker: 'TSLA', name: 'Tesla Inc.' },
      direction: 'sell',
      order_type: 'limit',
      quantity: 5,
      status: 'pending',
      limit_value: '200.00',
      stop_value: null,
      all_or_none: false,
      margin: false,
      account_id: 3,
      created_at: '2026-04-02T08:00:00Z',
      updated_at: '2026-04-02T08:00:00Z',
    }
    mockGet.mockResolvedValue({ data: { orders: [rawOrder], total_count: 1 } })
    const result = await getAllOrders()
    expect(result.orders[0].ticker).toBe('TSLA')
    expect(result.orders[0].security_name).toBe('Tesla Inc.')
  })
})

describe('approveOrder', () => {
  it('posts approve', async () => {
    const order = createMockOrder({ status: 'approved' })
    mockPost.mockResolvedValue({ data: order })
    const result = await approveOrder(1)
    expect(mockPost).toHaveBeenCalledWith('/api/v1/orders/1/approve')
    expect(result).toEqual(order)
  })
})

describe('declineOrder', () => {
  it('posts decline', async () => {
    const order = createMockOrder({ status: 'declined' })
    mockPost.mockResolvedValue({ data: order })
    const result = await declineOrder(1)
    expect(mockPost).toHaveBeenCalledWith('/api/v1/orders/1/decline')
    expect(result).toEqual(order)
  })
})
