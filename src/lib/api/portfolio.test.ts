import { apiClient } from '@/lib/api/axios'
import {
  getPortfolio,
  getPortfolioSummary,
  makePublicHolding,
  exerciseOption,
} from '@/lib/api/portfolio'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('getPortfolio', () => {
  it('GET /api/me/portfolio returns holdings', async () => {
    mockGet.mockResolvedValue({ data: { holdings: [], total_count: 0 } })
    const result = await getPortfolio()
    expect(mockGet).toHaveBeenCalledWith('/api/me/portfolio', {
      params: expect.any(URLSearchParams),
    })
    expect(result).toEqual({ holdings: [], total_count: 0 })
  })
})

describe('getPortfolioSummary', () => {
  it('GET /api/me/portfolio/summary returns summary', async () => {
    const summary = { total_value: '1000.00', total_profit_loss: '100.00' }
    mockGet.mockResolvedValue({ data: summary })
    const result = await getPortfolioSummary()
    expect(mockGet).toHaveBeenCalledWith('/api/me/portfolio/summary')
    expect(result).toEqual(summary)
  })
})

describe('makePublicHolding', () => {
  it('POST /api/me/portfolio/:id/make-public with quantity', async () => {
    mockPost.mockResolvedValue({ data: {} })
    await makePublicHolding(5, 3)
    expect(mockPost).toHaveBeenCalledWith('/api/me/portfolio/5/make-public', { quantity: 3 })
  })
})

describe('exerciseOption', () => {
  it('POST /api/me/portfolio/:id/exercise', async () => {
    mockPost.mockResolvedValue({ data: {} })
    await exerciseOption(7)
    expect(mockPost).toHaveBeenCalledWith('/api/me/portfolio/7/exercise')
  })
})
