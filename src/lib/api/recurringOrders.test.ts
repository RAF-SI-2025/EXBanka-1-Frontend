import { apiClient } from '@/lib/api/axios'
import { createRecurringOrder } from '@/lib/api/recurringOrders'
import type { CreateRecurringOrderPayload, RecurringOrder } from '@/types/recurringOrder'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { post: jest.fn() },
}))

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
