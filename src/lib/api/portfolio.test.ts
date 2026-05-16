import { apiClient } from '@/lib/api/axios'
import {
  getPortfolio,
  getPortfolioSummary,
  makeHoldingPublic,
  exerciseOption,
  getHoldingTransactions,
} from '@/lib/api/portfolio'
import {
  createMockHolding,
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
  it('fetches with filters', async () => {
    const response = { holdings: [createMockHolding()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getPortfolio({ security_type: 'stock', page: 1, page_size: 10 })
    expect(mockGet).toHaveBeenCalledWith('/me/portfolio', {
      params: { security_type: 'stock', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches with no filters', async () => {
    const response = { holdings: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getPortfolio()
    expect(mockGet).toHaveBeenCalledWith('/me/portfolio', { params: {} })
    expect(result).toEqual(response)
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

describe('makeHoldingPublic', () => {
  it('posts to /me/otc/stocks with direction=sell, holding_id, and quantity', async () => {
    // Phase 8: POST /api/v3/me/portfolio/:id/make-public was removed and
    // replaced by POST /api/v3/me/otc/stocks with a direction-keyed body
    // (spec § 47.1).
    const offer = { offer: { id: 99, public_quantity: 5 } }
    mockPost.mockResolvedValue({ data: offer })
    const result = await makeHoldingPublic(1, { quantity: 5 })
    expect(mockPost).toHaveBeenCalledWith('/me/otc/stocks', {
      direction: 'sell',
      holding_id: 1,
      quantity: 5,
    })
    expect(result).toEqual(offer)
  })

  it('forwards price_per_unit when provided', async () => {
    mockPost.mockResolvedValue({ data: { offer: { id: 99 } } })
    await makeHoldingPublic(1, { quantity: 5, price_per_unit: '175.50' })
    expect(mockPost).toHaveBeenCalledWith('/me/otc/stocks', {
      direction: 'sell',
      holding_id: 1,
      quantity: 5,
      price_per_unit: '175.50',
    })
  })
})

describe('exerciseOption', () => {
  it('posts exercise', async () => {
    const holding = createMockHolding({ security_type: 'option' })
    mockPost.mockResolvedValue({ data: holding })
    const result = await exerciseOption(1)
    expect(mockPost).toHaveBeenCalledWith('/me/portfolio/1/exercise')
    expect(result).toEqual(holding)
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
