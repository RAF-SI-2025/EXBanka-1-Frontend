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
