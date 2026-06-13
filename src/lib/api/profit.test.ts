import { apiClient } from '@/lib/api/axios'
import { getActuaryPerformance, getBankFundPositions } from '@/lib/api/profit'
import {
  createMockActuaryPerformance,
  createMockBankFundPosition,
} from '@/__tests__/fixtures/profit-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)

beforeEach(() => jest.clearAllMocks())

describe('getActuaryPerformance', () => {
  it('GET /actuaries/performance', async () => {
    mockGet.mockResolvedValue({ data: { actuaries: [createMockActuaryPerformance()] } })
    const result = await getActuaryPerformance()
    expect(mockGet).toHaveBeenCalledWith('/actuaries/performance')
    expect(result.actuaries).toHaveLength(1)
  })

  it('defaults actuaries[] to []', async () => {
    mockGet.mockResolvedValue({ data: { actuaries: null } })
    const result = await getActuaryPerformance()
    expect(result.actuaries).toEqual([])
  })
})

describe('getBankFundPositions', () => {
  it('GET /investment-funds/positions', async () => {
    mockGet.mockResolvedValue({ data: { positions: [createMockBankFundPosition()] } })
    const result = await getBankFundPositions()
    expect(mockGet).toHaveBeenCalledWith('/investment-funds/positions')
    expect(result.positions).toHaveLength(1)
  })

  it('defaults positions[] to []', async () => {
    mockGet.mockResolvedValue({ data: { positions: null } })
    const result = await getBankFundPositions()
    expect(result.positions).toEqual([])
  })
})
