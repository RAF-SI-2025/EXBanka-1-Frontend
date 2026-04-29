import { apiClient } from '@/lib/api/axios'
import {
  getFunds,
  getFund,
  createFund,
  updateFund,
  investInFund,
  redeemFromFund,
  getMyFundPositions,
} from '@/lib/api/funds'
import {
  createMockFund,
  createMockFundContribution,
  createMockClientFundPosition,
} from '@/__tests__/fixtures/fund-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)

beforeEach(() => jest.clearAllMocks())

describe('getFunds', () => {
  it('GET /investment-funds with filters', async () => {
    mockGet.mockResolvedValue({ data: { funds: [createMockFund()], total: 1 } })
    const result = await getFunds({ search: 'Alpha', active_only: true })
    expect(mockGet).toHaveBeenCalledWith('/investment-funds', {
      params: { search: 'Alpha', active_only: true },
    })
    expect(result.funds).toHaveLength(1)
  })

  it('defaults funds[] to [] when backend returns null', async () => {
    mockGet.mockResolvedValue({ data: { funds: null, total: 0 } })
    const result = await getFunds()
    expect(result.funds).toEqual([])
  })
})

describe('getFund', () => {
  it('GET /investment-funds/:id', async () => {
    mockGet.mockResolvedValue({
      data: { fund: createMockFund({ id: 101 }), holdings: [], performance: [] },
    })
    const result = await getFund(101)
    expect(mockGet).toHaveBeenCalledWith('/investment-funds/101')
    expect(result.fund.id).toBe(101)
    expect(result.holdings).toEqual([])
  })
})

describe('createFund', () => {
  it('POST /investment-funds with payload', async () => {
    mockPost.mockResolvedValue({ data: { fund: createMockFund() } })
    await createFund({ name: 'Alpha', description: 'IT', minimum_contribution_rsd: '1000.00' })
    expect(mockPost).toHaveBeenCalledWith('/investment-funds', {
      name: 'Alpha',
      description: 'IT',
      minimum_contribution_rsd: '1000.00',
    })
  })
})

describe('updateFund', () => {
  it('PUT /investment-funds/:id with patch', async () => {
    mockPut.mockResolvedValue({ data: { fund: createMockFund() } })
    await updateFund(101, { active: false })
    expect(mockPut).toHaveBeenCalledWith('/investment-funds/101', { active: false })
  })
})

describe('investInFund', () => {
  it('POST /investment-funds/:id/invest', async () => {
    mockPost.mockResolvedValue({ data: { contribution: createMockFundContribution() } })
    await investInFund(101, {
      source_account_id: 5,
      amount: '10000.00',
      currency: 'RSD',
    })
    expect(mockPost).toHaveBeenCalledWith('/investment-funds/101/invest', {
      source_account_id: 5,
      amount: '10000.00',
      currency: 'RSD',
    })
  })
})

describe('redeemFromFund', () => {
  it('POST /investment-funds/:id/redeem', async () => {
    mockPost.mockResolvedValue({ data: { contribution: createMockFundContribution() } })
    await redeemFromFund(101, { amount_rsd: '5000.00', target_account_id: 5 })
    expect(mockPost).toHaveBeenCalledWith('/investment-funds/101/redeem', {
      amount_rsd: '5000.00',
      target_account_id: 5,
    })
  })
})

describe('getMyFundPositions', () => {
  it('GET /me/investment-funds', async () => {
    mockGet.mockResolvedValue({ data: { positions: [createMockClientFundPosition()] } })
    const result = await getMyFundPositions()
    expect(mockGet).toHaveBeenCalledWith('/me/investment-funds')
    expect(result.positions).toHaveLength(1)
  })

  it('defaults positions[] to [] when backend returns null', async () => {
    mockGet.mockResolvedValue({ data: { positions: null } })
    const result = await getMyFundPositions()
    expect(result.positions).toEqual([])
  })
})
