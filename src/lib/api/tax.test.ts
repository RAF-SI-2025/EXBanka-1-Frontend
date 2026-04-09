import { apiClient } from '@/lib/api/axios'
import { getTaxRecords, collectTaxes } from '@/lib/api/tax'
import { createMockTaxRecord } from '@/__tests__/fixtures/tax-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
beforeEach(() => jest.clearAllMocks())

describe('getTaxRecords', () => {
  it('fetches with filters', async () => {
    const response = { tax_records: [createMockTaxRecord()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getTaxRecords({ user_type: 'client', page: 1, page_size: 10 })
    expect(mockGet).toHaveBeenCalledWith('/api/v1/tax', {
      params: { user_type: 'client', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches with no filters', async () => {
    const response = { tax_records: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })
    const result = await getTaxRecords()
    expect(mockGet).toHaveBeenCalledWith('/api/v1/tax', { params: {} })
    expect(result).toEqual(response)
  })
})

describe('collectTaxes', () => {
  it('posts collect', async () => {
    const response = { collected_count: 5, total_collected_rsd: '3750.00', failed_count: 0 }
    mockPost.mockResolvedValue({ data: response })
    const result = await collectTaxes()
    expect(mockPost).toHaveBeenCalledWith('/api/v1/tax/collect')
    expect(result).toEqual(response)
  })
})
