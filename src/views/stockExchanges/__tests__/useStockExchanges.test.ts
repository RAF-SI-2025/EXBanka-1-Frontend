import { act, renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useSetTestingMode,
  useStockExchanges,
  useTestingMode,
} from '@/views/stockExchanges/hooks/useStockExchanges'
import { stockExchangesApi } from '@/views/stockExchanges/api/stockExchangesApi'
import { createMockStockExchange } from '@/views/stockExchanges/__tests__/fixtures'

jest.mock('@/views/stockExchanges/api/stockExchangesApi', () => ({
  stockExchangesApi: {
    list: jest.fn(),
    getTestingMode: jest.fn(),
    setTestingMode: jest.fn(),
  },
}))

beforeEach(() => jest.clearAllMocks())

describe('useStockExchanges', () => {
  it('fetches exchanges with no filters by default', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    jest.mocked(stockExchangesApi.list).mockResolvedValue(response)

    const { result } = renderHook(() => useStockExchanges(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(stockExchangesApi.list).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    jest.mocked(stockExchangesApi.list).mockResolvedValue(response)

    const filters = { search: 'NYSE', page: 1, page_size: 10 }
    const { result } = renderHook(() => useStockExchanges(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(stockExchangesApi.list).toHaveBeenCalledWith(filters)
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
