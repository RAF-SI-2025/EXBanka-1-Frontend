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
} from '@/lib/api/securities'
import {
  createMockStock,
  createMockFutures,
  createMockForex,
  createMockOption,
  createMockPriceHistory,
} from '@/__tests__/fixtures/security-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
beforeEach(() => jest.clearAllMocks())

describe('stocks', () => {
  it('getStocks fetches with filters', async () => {
    const response = { stocks: [createMockStock()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getStocks({ search: 'AAPL', page: 1, page_size: 10 })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/stocks', {
      params: { search: 'AAPL', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('getStock fetches by ID', async () => {
    const stock = createMockStock()
    mockGet.mockResolvedValue({ data: stock })
    const result = await getStock(1)
    expect(mockGet).toHaveBeenCalledWith('/api/securities/stocks/1')
    expect(result).toEqual(stock)
  })

  it('getStockHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getStockHistory(1, { period: 'month' })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/stocks/1/history', {
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
    expect(mockGet).toHaveBeenCalledWith('/api/securities/futures', {
      params: { search: 'CL' },
    })
    expect(result).toEqual(response)
  })

  it('getFuture fetches by ID', async () => {
    const futures = createMockFutures()
    mockGet.mockResolvedValue({ data: futures })
    const result = await getFuture(1)
    expect(mockGet).toHaveBeenCalledWith('/api/securities/futures/1')
    expect(result).toEqual(futures)
  })

  it('getFutureHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getFutureHistory(1, { period: 'week' })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/futures/1/history', {
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
    expect(mockGet).toHaveBeenCalledWith('/api/securities/forex', {
      params: { base_currency: 'EUR' },
    })
    expect(result).toEqual(response)
  })

  it('getForexPair fetches by ID', async () => {
    const forex = createMockForex()
    mockGet.mockResolvedValue({ data: forex })
    const result = await getForexPair(1)
    expect(mockGet).toHaveBeenCalledWith('/api/securities/forex/1')
    expect(result).toEqual(forex)
  })

  it('getForexHistory fetches price history', async () => {
    const response = { history: createMockPriceHistory(), total_count: 5 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getForexHistory(1, { period: 'year' })
    expect(mockGet).toHaveBeenCalledWith('/api/securities/forex/1/history', {
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
    expect(mockGet).toHaveBeenCalledWith('/api/securities/options', {
      params: { stock_id: 1 },
    })
    expect(result).toEqual(response)
  })

  it('getOption fetches by ID', async () => {
    const option = createMockOption()
    mockGet.mockResolvedValue({ data: option })
    const result = await getOption(1)
    expect(mockGet).toHaveBeenCalledWith('/api/securities/options/1')
    expect(result).toEqual(option)
  })
})
