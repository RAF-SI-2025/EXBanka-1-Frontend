import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useStockExchanges, useTestingMode, useSetTestingMode } from '@/hooks/useStockExchanges'
import * as stockExchangesApi from '@/lib/api/stockExchanges'
import { createMockStockExchange } from '@/__tests__/fixtures/stockExchange-fixtures'

jest.mock('@/lib/api/stockExchanges')

beforeEach(() => jest.clearAllMocks())

describe('useStockExchanges', () => {
  it('fetches exchanges with no filters by default', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    jest.mocked(stockExchangesApi.getStockExchanges).mockResolvedValue(response)

    const { result } = renderHook(() => useStockExchanges(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(stockExchangesApi.getStockExchanges).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    jest.mocked(stockExchangesApi.getStockExchanges).mockResolvedValue(response)

    const filters = { search: 'NYSE', page: 1, page_size: 10 }
    const { result } = renderHook(() => useStockExchanges(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(stockExchangesApi.getStockExchanges).toHaveBeenCalledWith(filters)
  })
})

describe('useTestingMode', () => {
  it('fetches current testing mode', async () => {
    jest.mocked(stockExchangesApi.getTestingMode).mockResolvedValue({ testing_mode: false })

    const { result } = renderHook(() => useTestingMode(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ testing_mode: false })
  })
})

describe('useSetTestingMode', () => {
  it('calls setTestingMode', async () => {
    jest.mocked(stockExchangesApi.setTestingMode).mockResolvedValue({ testing_mode: true })

    const { result } = renderHook(() => useSetTestingMode(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(true)
    })

    expect(stockExchangesApi.setTestingMode).toHaveBeenCalledWith(true)
  })
})
