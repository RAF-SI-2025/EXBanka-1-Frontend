import { renderHook, act, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useCancelRecurringOrder,
  useCreateRecurringOrder,
  usePauseRecurringOrder,
  useRecurringOrders,
  useResumeRecurringOrder,
} from '@/hooks/useRecurringOrders'
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

describe('useRecurringOrders', () => {
  it('returns the list from getMyRecurringOrders', async () => {
    jest.mocked(recurringOrdersApi.getMyRecurringOrders).mockResolvedValue([order])

    const { result } = renderHook(() => useRecurringOrders(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([order])
  })
})

describe('usePauseRecurringOrder', () => {
  it('calls pauseRecurringOrder with the id', async () => {
    jest.mocked(recurringOrdersApi.pauseRecurringOrder).mockResolvedValue(order)

    const { result } = renderHook(() => usePauseRecurringOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(recurringOrdersApi.pauseRecurringOrder).toHaveBeenCalledWith(1)
  })
})

describe('useResumeRecurringOrder', () => {
  it('calls resumeRecurringOrder with the id', async () => {
    jest.mocked(recurringOrdersApi.resumeRecurringOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useResumeRecurringOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(recurringOrdersApi.resumeRecurringOrder).toHaveBeenCalledWith(1)
  })
})

describe('useCancelRecurringOrder', () => {
  it('calls cancelRecurringOrder with the id', async () => {
    jest.mocked(recurringOrdersApi.cancelRecurringOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useCancelRecurringOrder(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(recurringOrdersApi.cancelRecurringOrder).toHaveBeenCalledWith(1)
  })
})
