import { apiClient } from '@/lib/api/axios'
import {
  cancelRecurringOrder,
  createRecurringOrder,
  getMyRecurringOrders,
  pauseRecurringOrder,
  resumeRecurringOrder,
} from '@/lib/api/recurringOrders'
import type { CreateRecurringOrderPayload, RecurringOrder } from '@/types/recurringOrder'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

const samplePayload: CreateRecurringOrderPayload = {
  listing_id: 7,
  side: 'buy',
  quantity: 10,
  account_id: 42,
  interval: 'monthly',
  day_of_month: 15,
  start_date_unix: 1731699200,
  end_date_unix: 0,
}

const sampleOrder: RecurringOrder = {
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
}

describe('createRecurringOrder', () => {
  it('POSTs the payload to /me/recurring-orders and returns the recurring_order', async () => {
    mockPost.mockResolvedValue({ data: { recurring_order: sampleOrder } })

    const result = await createRecurringOrder(samplePayload)

    expect(mockPost).toHaveBeenCalledWith('/me/recurring-orders', samplePayload)
    expect(result).toEqual(sampleOrder)
  })
})

describe('getMyRecurringOrders', () => {
  it('GETs /me/recurring-orders and returns the recurring_orders array', async () => {
    mockGet.mockResolvedValue({ data: { recurring_orders: [sampleOrder] } })

    const result = await getMyRecurringOrders()

    expect(mockGet).toHaveBeenCalledWith('/me/recurring-orders')
    expect(result).toEqual([sampleOrder])
  })

  it('defaults to [] when the backend returns null', async () => {
    mockGet.mockResolvedValue({ data: { recurring_orders: null } })

    const result = await getMyRecurringOrders()

    expect(result).toEqual([])
  })
})

describe('pauseRecurringOrder', () => {
  it('POSTs /me/recurring-orders/:id/pause and returns the recurring_order', async () => {
    const paused = { ...sampleOrder, status: 'paused' as const }
    mockPost.mockResolvedValue({ data: { recurring_order: paused } })

    const result = await pauseRecurringOrder(1)

    expect(mockPost).toHaveBeenCalledWith('/me/recurring-orders/1/pause')
    expect(result).toEqual(paused)
  })
})

describe('resumeRecurringOrder', () => {
  it('POSTs /me/recurring-orders/:id/resume and returns the recurring_order', async () => {
    mockPost.mockResolvedValue({ data: { recurring_order: sampleOrder } })

    const result = await resumeRecurringOrder(1)

    expect(mockPost).toHaveBeenCalledWith('/me/recurring-orders/1/resume')
    expect(result).toEqual(sampleOrder)
  })
})

describe('cancelRecurringOrder', () => {
  it('POSTs /me/recurring-orders/:id/cancel and returns the recurring_order', async () => {
    const cancelled = { ...sampleOrder, status: 'cancelled' as const }
    mockPost.mockResolvedValue({ data: { recurring_order: cancelled } })

    const result = await cancelRecurringOrder(1)

    expect(mockPost).toHaveBeenCalledWith('/me/recurring-orders/1/cancel')
    expect(result).toEqual(cancelled)
  })
})
