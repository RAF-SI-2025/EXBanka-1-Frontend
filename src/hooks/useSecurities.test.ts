import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useStocks,
  useStock,
  useStockHistory,
  useFutures,
  useFuture,
  useFutureHistory,
  useForexPairs,
  useForexPair,
  useForexHistory,
  useOptions,
  useListingMap,
} from '@/hooks/useSecurities'
import * as securitiesApi from '@/lib/api/securities'
import {
  createMockStock,
  createMockFutures,
  createMockForex,
  createMockOption,
  createMockPriceHistory,
} from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/securities')

beforeEach(() => jest.clearAllMocks())

describe('useStocks', () => {
  it('fetches stocks with no filters by default', async () => {
    const response = { stocks: [createMockStock()], total_count: 1 }
    jest.mocked(securitiesApi.getStocks).mockResolvedValue(response)

    const { result } = renderHook(() => useStocks(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(securitiesApi.getStocks).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { stocks: [createMockStock()], total_count: 1 }
    jest.mocked(securitiesApi.getStocks).mockResolvedValue(response)

    const filters = { search: 'AAPL', page: 1, page_size: 10 }
    const { result } = renderHook(() => useStocks(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(securitiesApi.getStocks).toHaveBeenCalledWith(filters)
  })
})

describe('useStock', () => {
  it('fetches a single stock by ID', async () => {
    const stock = createMockStock()
    jest.mocked(securitiesApi.getStock).mockResolvedValue(stock)

    const { result } = renderHook(() => useStock(1), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(stock)
  })

  it('is disabled when id <= 0', () => {
    const { result } = renderHook(() => useStock(0), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(securitiesApi.getStock).not.toHaveBeenCalled()
  })
})

describe('useStockHistory', () => {
  it('fetches stock price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    jest.mocked(securitiesApi.getStockHistory).mockResolvedValue(response)

    const { result } = renderHook(() => useStockHistory(1, { period: 'month' }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
  })
})

describe('useFutures', () => {
  it('fetches futures with filters', async () => {
    const response = { futures: [createMockFutures()], total_count: 1 }
    jest.mocked(securitiesApi.getFutures).mockResolvedValue(response)

    const { result } = renderHook(() => useFutures({ search: 'CL' }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(securitiesApi.getFutures).toHaveBeenCalledWith({ search: 'CL' })
  })
})

describe('useFuture', () => {
  it('fetches a single future by ID', async () => {
    const future = createMockFutures()
    jest.mocked(securitiesApi.getFuture).mockResolvedValue(future)

    const { result } = renderHook(() => useFuture(1), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(future)
  })
})

describe('useFutureHistory', () => {
  it('fetches future price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    jest.mocked(securitiesApi.getFutureHistory).mockResolvedValue(response)

    const { result } = renderHook(() => useFutureHistory(1, { period: 'week' }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
  })
})

describe('useForexPairs', () => {
  it('fetches forex pairs with filters', async () => {
    const response = { forex_pairs: [createMockForex()], total_count: 1 }
    jest.mocked(securitiesApi.getForexPairs).mockResolvedValue(response)

    const { result } = renderHook(() => useForexPairs({ base_currency: 'EUR' }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(securitiesApi.getForexPairs).toHaveBeenCalledWith({ base_currency: 'EUR' })
  })
})

describe('useForexPair', () => {
  it('fetches a single forex pair by ID', async () => {
    const forex = createMockForex()
    jest.mocked(securitiesApi.getForexPair).mockResolvedValue(forex)

    const { result } = renderHook(() => useForexPair(1), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(forex)
  })
})

describe('useForexHistory', () => {
  it('fetches forex price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    jest.mocked(securitiesApi.getForexHistory).mockResolvedValue(response)

    const { result } = renderHook(() => useForexHistory(1, { period: 'year' }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
  })
})

describe('useOptions', () => {
  it('fetches options for a stock', async () => {
    const response = { options: [createMockOption()], total_count: 1 }
    jest.mocked(securitiesApi.getOptions).mockResolvedValue(response)

    const { result } = renderHook(() => useOptions({ stock_id: 1 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
  })

  it('is disabled when stock_id <= 0', () => {
    const { result } = renderHook(() => useOptions({ stock_id: 0 }), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(securitiesApi.getOptions).not.toHaveBeenCalled()
  })
})

describe('useListingMap', () => {
  it('keys the map by listing_id so order.listing_id resolves to the correct security', async () => {
    const stock = createMockStock({ id: 10, listing_id: 101, ticker: 'AAPL', name: 'Apple Inc.' })
    const forex = createMockForex({
      id: 20,
      listing_id: 202,
      ticker: 'RSD/CHF',
      name: 'Serbian Dinar to Swiss Franc',
    })

    jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks: [stock], total_count: 1 })
    jest.mocked(securitiesApi.getFutures).mockResolvedValue({ futures: [], total_count: 0 })
    jest
      .mocked(securitiesApi.getForexPairs)
      .mockResolvedValue({ forex_pairs: [forex], total_count: 1 })

    const { result } = renderHook(() => useListingMap(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.size).toBeGreaterThan(0))

    // Order with listing_id 101 should resolve to AAPL, not the forex pair
    expect(result.current.get(101)).toEqual({ ticker: 'AAPL', name: 'Apple Inc.' })
    // Order with listing_id 202 should resolve to the forex pair
    expect(result.current.get(202)).toEqual({
      ticker: 'RSD/CHF',
      name: 'Serbian Dinar to Swiss Franc',
    })
    // Security's own id (10) should NOT be in the map
    expect(result.current.get(10)).toBeUndefined()
  })
})
