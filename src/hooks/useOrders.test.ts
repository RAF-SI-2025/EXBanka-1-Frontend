import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useMyOrders,
  useCreateOrder,
  useCancelOrder,
  useAllOrders,
  useApproveOrder,
  useDeclineOrder,
} from '@/hooks/useOrders'
import * as ordersApi from '@/lib/api/orders'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'

jest.mock('@/lib/api/orders')

beforeEach(() => jest.clearAllMocks())

describe('useMyOrders', () => {
  it('fetches orders with no filters by default', async () => {
    const response = { orders: [createMockOrder()], total_count: 1 }
    jest.mocked(ordersApi.getMyOrders).mockResolvedValue(response)

    const { result } = renderHook(() => useMyOrders(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(ordersApi.getMyOrders).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { orders: [createMockOrder()], total_count: 1 }
    jest.mocked(ordersApi.getMyOrders).mockResolvedValue(response)

    const filters = { status: 'pending' as const, page: 1, page_size: 10 }
    const { result } = renderHook(() => useMyOrders(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(ordersApi.getMyOrders).toHaveBeenCalledWith(filters)
  })
})

describe('useCreateOrder', () => {
  it('calls createOrder', async () => {
    const order = createMockOrder()
    jest.mocked(ordersApi.createOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        listing_id: 42,
        direction: 'buy',
        order_type: 'market',
        quantity: 10,
      })
    })

    expect(ordersApi.createOrder).toHaveBeenCalledWith({
      listing_id: 42,
      direction: 'buy',
      order_type: 'market',
      quantity: 10,
    })
  })
})

describe('useCancelOrder', () => {
  it('calls cancelOrder', async () => {
    const order = createMockOrder({ status: 'cancelled' })
    jest.mocked(ordersApi.cancelOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(ordersApi.cancelOrder).toHaveBeenCalledWith(1)
  })
})

describe('useAllOrders', () => {
  it('fetches all orders with filters', async () => {
    const response = { orders: [createMockOrder()], total_count: 1 }
    jest.mocked(ordersApi.getAllOrders).mockResolvedValue(response)

    const filters = { status: 'pending' as const }
    const { result } = renderHook(() => useAllOrders(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(ordersApi.getAllOrders).toHaveBeenCalledWith(filters)
  })
})

describe('useApproveOrder', () => {
  it('calls approveOrder', async () => {
    const order = createMockOrder({ status: 'approved' })
    jest.mocked(ordersApi.approveOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useApproveOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(ordersApi.approveOrder).toHaveBeenCalledWith(1)
  })
})

describe('useDeclineOrder', () => {
  it('calls declineOrder', async () => {
    const order = createMockOrder({ status: 'declined' })
    jest.mocked(ordersApi.declineOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useDeclineOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(ordersApi.declineOrder).toHaveBeenCalledWith(1)
  })
})
