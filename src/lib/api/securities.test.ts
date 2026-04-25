import { apiClient } from '@/lib/api/axios'
import {
  getStocks,
  getStock,
  getStockHistory,
  getFutures,
  getFuture,
  getFutureHistory,
  getForexPairs,
  getForexPair,
  getForexHistory,
  getOptions,
  getOption,
  createOptionOrder,
  exerciseOption,
} from '@/lib/api/securities'
import {
  createMockStock,
  createMockFutures,
  createMockForex,
  createMockOption,
  createMockPriceHistory,
} from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
beforeEach(() => jest.clearAllMocks())

describe('stocks', () => {
  it('getStocks fetches with filters', async () => {
    const response = { stocks: [createMockStock()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getStocks({ search: 'AAPL', page: 1, page_size: 10 })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/stocks', {
      params: { search: 'AAPL', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('getStocks preserves security id and extracts listing_id when listing has its own id', async () => {
    const rawResponse = {
      stocks: [
        {
          id: 5,
          ticker: 'AAPL',
          name: 'Apple',
          listing: { id: 10, exchange_acronym: 'NYSE', price: '178.50' },
        },
      ],
      total_count: 1,
    }
    mockGet.mockResolvedValue({ data: rawResponse })
    const result = await getStocks()
    expect(result.stocks[0].id).toBe(5)
    expect(result.stocks[0].listing_id).toBe(10)
    expect(result.stocks[0].exchange_acronym).toBe('NYSE')
  })

  it('getStock fetches by ID', async () => {
    const stock = createMockStock()
    mockGet.mockResolvedValue({ data: stock })
    const result = await getStock(1)
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/stocks/1')
    expect(result).toEqual(stock)
  })

  it('getStockHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getStockHistory(1, { period: 'month' })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/stocks/1/history', {
      params: { period: 'month' },
    })
    expect(result).toEqual(response)
  })
})

describe('futures', () => {
  it('getFutures fetches with filters', async () => {
    const response = { futures: [createMockFutures()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getFutures({ search: 'CL' })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/futures', {
      params: { search: 'CL' },
    })
    expect(result).toEqual(response)
  })

  it('getFutures preserves security id and extracts listing_id when listing has its own id', async () => {
    const rawResponse = {
      futures: [
        { id: 7, ticker: 'CLJ26', listing: { id: 20, exchange_acronym: 'NYMEX', price: '72.50' } },
      ],
      total_count: 1,
    }
    mockGet.mockResolvedValue({ data: rawResponse })
    const result = await getFutures()
    expect(result.futures[0].id).toBe(7)
    expect(result.futures[0].listing_id).toBe(20)
  })

  it('getFuture fetches by ID', async () => {
    const futures = createMockFutures()
    mockGet.mockResolvedValue({ data: futures })
    const result = await getFuture(1)
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/futures/1')
    expect(result).toEqual(futures)
  })

  it('getFutureHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getFutureHistory(1, { period: 'week' })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/futures/1/history', {
      params: { period: 'week' },
    })
    expect(result).toEqual(response)
  })
})

describe('forex', () => {
  it('getForexPairs fetches with filters', async () => {
    const response = { forex_pairs: [createMockForex()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getForexPairs({ base_currency: 'EUR' })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/forex', {
      params: { base_currency: 'EUR' },
    })
    expect(result).toEqual(response)
  })

  it('getForexPairs preserves security id and extracts listing_id when listing has its own id', async () => {
    const rawResponse = {
      forex_pairs: [
        { id: 3, ticker: 'EUR/USD', listing: { id: 30, price: '1.0850', exchange_rate: '1.0850' } },
      ],
      total_count: 1,
    }
    mockGet.mockResolvedValue({ data: rawResponse })
    const result = await getForexPairs()
    expect(result.forex_pairs[0].id).toBe(3)
    expect(result.forex_pairs[0].listing_id).toBe(30)
  })

  it('getForexPair fetches by ID', async () => {
    const forex = createMockForex()
    mockGet.mockResolvedValue({ data: forex })
    const result = await getForexPair(1)
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/forex/1')
    expect(result).toEqual(forex)
  })

  it('getForexHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getForexHistory(1, { period: 'year' })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/securities/forex/1/history', {
      params: { period: 'year' },
    })
    expect(result).toEqual(response)
  })
})

describe('options', () => {
  it('getOptions fetches for a stock', async () => {
    const response = { options: [createMockOption()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getOptions({ stock_id: 1 })
    expect(mockGet).toHaveBeenCalledWith('/api/v2/securities/options', {
      params: { stock_id: 1 },
    })
    expect(result).toEqual(response)
  })

  it('getOption fetches by ID', async () => {
    const option = createMockOption()
    mockGet.mockResolvedValue({ data: option })
    const result = await getOption(1)
    expect(mockGet).toHaveBeenCalledWith('/api/v2/securities/options/1')
    expect(result).toEqual(option)
  })

  it('createOptionOrder posts to option orders endpoint', async () => {
    mockPost.mockResolvedValue({ data: { id: 10 } })
    const payload = {
      direction: 'buy' as const,
      order_type: 'market' as const,
      quantity: 5,
      account_id: 1,
    }
    await createOptionOrder(42, payload)
    expect(mockPost).toHaveBeenCalledWith('/api/v2/options/42/orders', payload)
  })

  it('exerciseOption posts to option exercise endpoint', async () => {
    mockPost.mockResolvedValue({
      data: {
        id: 1,
        option_ticker: 'AAPL',
        exercised_quantity: 5,
        shares_affected: 500,
        profit: '150.00',
      },
    })
    await exerciseOption(42)
    expect(mockPost).toHaveBeenCalledWith('/api/v2/options/42/exercise')
  })
})
