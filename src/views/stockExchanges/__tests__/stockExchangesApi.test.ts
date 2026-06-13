import { apiClient } from '@/lib/api/axios'
import { stockExchangesApi } from '@/views/stockExchanges/api/stockExchangesApi'
import { createMockStockExchange } from '@/views/stockExchanges/__tests__/fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('stockExchangesApi.list', () => {
  it('fetches exchanges with filters', async () => {
    const response = { exchanges: [createMockStockExchange()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })

    const result = await stockExchangesApi.list({ search: 'NYSE', page: 1, page_size: 10 })

    expect(mockGet).toHaveBeenCalledWith('/stock-exchanges', {
      params: { search: 'NYSE', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches exchanges with no filters', async () => {
    const response = { exchanges: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })

    const result = await stockExchangesApi.list()

    expect(mockGet).toHaveBeenCalledWith('/stock-exchanges', { params: {} })
    expect(result).toEqual(response)
  })
})

describe('stockExchangesApi.getTestingMode', () => {
  it('fetches current testing mode status', async () => {
    mockGet.mockResolvedValue({ data: { testing_mode: false } })

    const result = await stockExchangesApi.getTestingMode()

    expect(mockGet).toHaveBeenCalledWith('/stock-exchanges/testing-mode')
    expect(result).toEqual({ testing_mode: false })
  })
})

describe('stockExchangesApi.setTestingMode', () => {
  it('posts testing mode enabled', async () => {
    mockPost.mockResolvedValue({ data: { testing_mode: true } })

    const result = await stockExchangesApi.setTestingMode(true)

    expect(mockPost).toHaveBeenCalledWith('/stock-exchanges/testing-mode', { enabled: true })
    expect(result).toEqual({ testing_mode: true })
  })

  it('posts testing mode disabled', async () => {
    mockPost.mockResolvedValue({ data: { testing_mode: false } })

    const result = await stockExchangesApi.setTestingMode(false)

    expect(mockPost).toHaveBeenCalledWith('/stock-exchanges/testing-mode', { enabled: false })
    expect(result).toEqual({ testing_mode: false })
  })
})
