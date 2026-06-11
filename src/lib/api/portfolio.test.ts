import { apiClient } from '@/lib/api/axios'
import {
  getPortfolio,
  getPortfolioSummary,
  exerciseOption,
  getHoldingTransactions,
} from '@/lib/api/portfolio'
import {
  createMockPortfolioResponse,
  createMockSecurityPosition,
  createMockPortfolioSummary,
  createMockHoldingTransaction,
} from '@/__tests__/fixtures/portfolio-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
beforeEach(() => jest.clearAllMocks())

describe('getPortfolio', () => {
  it('fetches the unified portfolio with no query parameters (spec §48.1)', async () => {
    const response = createMockPortfolioResponse()
    mockGet.mockResolvedValue({ data: response })
    const result = await getPortfolio()
    expect(mockGet).toHaveBeenCalledWith('/me/portfolio')
    expect(result).toEqual(response)
  })

  it('defaults missing position arrays to empty arrays', async () => {
    mockGet.mockResolvedValue({
      data: {
        portfolio_id: 'client-1',
        owner_type: 'client',
        owner_id: 1,
        owner_name: '',
        total_value_rsd: '0',
        total_profit_rsd: '0',
        total_profit_pct: '0',
        securities: { total_value_rsd: '0', total_profit_rsd: '0', total_profit_pct: '0' },
        funds: { total_value_rsd: '0', total_profit_rsd: '0', total_profit_pct: '0' },
      },
    })
    const result = await getPortfolio()
    expect(result.securities.positions).toEqual([])
    expect(result.funds.positions).toEqual([])
  })
})

describe('getPortfolioSummary', () => {
  it('fetches summary', async () => {
    const summary = createMockPortfolioSummary()
    mockGet.mockResolvedValue({ data: summary })
    const result = await getPortfolioSummary()
    expect(mockGet).toHaveBeenCalledWith('/me/portfolio/summary')
    expect(result).toEqual(summary)
  })
})

describe('exerciseOption', () => {
  it('posts exercise against the holding_id', async () => {
    const position = createMockSecurityPosition({ asset_type: 'option', holding_id: 32 })
    mockPost.mockResolvedValue({ data: position })
    const result = await exerciseOption(32)
    expect(mockPost).toHaveBeenCalledWith('/me/portfolio/32/exercise')
    expect(result).toEqual(position)
  })
})

describe('getHoldingTransactions', () => {
  it('fetches transactions for a holding', async () => {
    const txn = createMockHoldingTransaction()
    const response = { transactions: [txn], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getHoldingTransactions(5, { page: 1, page_size: 10 })
    expect(mockGet).toHaveBeenCalledWith('/me/holdings/5/transactions', {
      params: { page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('returns empty array when response has no transactions', async () => {
    mockGet.mockResolvedValue({ data: { total_count: 0 } })
    const result = await getHoldingTransactions(5)
    expect(result.transactions).toEqual([])
  })
})
