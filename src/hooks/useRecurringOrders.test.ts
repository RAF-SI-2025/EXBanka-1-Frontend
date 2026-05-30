import { renderHook, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useCreateRecurringOrder } from '@/hooks/useRecurringOrders'
import * as recurringOrdersApi from '@/lib/api/recurringOrders'
import type { CreateRecurringOrderPayload, RecurringOrder } from '@/types/recurringOrder'

jest.mock('@/lib/api/recurringOrders')

beforeEach(() => jest.clearAllMocks())

const payload: CreateRecurringOrderPayload = {
  listing_id: 7,
  side: 'buy',
  quantity: 10,
  account_id: 42,
  interval: 'monthly',
  day_of_month: 15,
  start_date_unix: 1731699200,
  end_date_unix: 0,
}

const order = { id: 1, status: 'active' } as RecurringOrder

describe('useCreateRecurringOrder', () => {
  it('calls createRecurringOrder with the payload', async () => {
    jest.mocked(recurringOrdersApi.createRecurringOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useCreateRecurringOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(recurringOrdersApi.createRecurringOrder).toHaveBeenCalledWith(payload)
  })
})
