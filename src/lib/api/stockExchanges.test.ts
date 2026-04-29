import { apiClient } from '@/lib/api/axios'
import { getStockExchanges, getTestingMode, setTestingMode } from '@/lib/api/stockExchanges'
import { createMockStockExchange } from '@/__tests__/fixtures/stockExchange-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('getStockExchanges', () => {
  it('fetches exchanges with filters', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getStockExchanges({ search: 'NYSE', page: 1, page_size: 10 })

    expect(mockGet).toHaveBeenCalledWith('/stock-exchanges', {
      params: { search: 'NYSE', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches exchanges with no filters', async () => {
    const response = { exchanges: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getStockExchanges()

    expect(mockGet).toHaveBeenCalledWith('/stock-exchanges', { params: {} })
    expect(result).toEqual(response)
  })
})

describe('getTestingMode', () => {
  it('fetches current testing mode status', async () => {
    mockGet.mockResolvedValue({ data: { testing_mode: false } })

    const result = await getTestingMode()

    expect(mockGet).toHaveBeenCalledWith('/stock-exchanges/testing-mode')
    expect(result).toEqual({ testing_mode: false })
  })
})

describe('setTestingMode', () => {
  it('posts testing mode enabled', async () => {
    mockPost.mockResolvedValue({ data: { testing_mode: true } })

    const result = await setTestingMode(true)

    expect(mockPost).toHaveBeenCalledWith('/stock-exchanges/testing-mode', { enabled: true })
    expect(result).toEqual({ testing_mode: true })
  })

  it('posts testing mode disabled', async () => {
    mockPost.mockResolvedValue({ data: { testing_mode: false } })

    const result = await setTestingMode(false)

    expect(mockPost).toHaveBeenCalledWith('/stock-exchanges/testing-mode', {
      enabled: false,
    })
    expect(result).toEqual({ testing_mode: false })
  })
})
