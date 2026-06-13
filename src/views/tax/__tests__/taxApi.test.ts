import { apiClient } from '@/lib/api/axios'
import { taxApi } from '@/views/tax/api/taxApi'
import { createMockTaxRecord } from '@/views/tax/__tests__/fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
beforeEach(() => jest.clearAllMocks())

describe('taxApi.list', () => {
  it('fetches with filters', async () => {
    const response = { tax_records: [createMockTaxRecord()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })
    const result = await taxApi.list({ user_type: 'client', page: 1, page_size: 10 })
    expect(mockGet).toHaveBeenCalledWith('/tax', {
      params: { user_type: 'client', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches with no filters', async () => {
    const response = { tax_records: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })
    const result = await taxApi.list()
    expect(mockGet).toHaveBeenCalledWith('/tax', { params: {} })
    expect(result).toEqual(response)
  })
})

describe('taxApi.collect', () => {
  it('posts collect', async () => {
    const response = { collected_count: 5, total_collected_rsd: '3750.00', failed_count: 0 }
    mockPost.mockResolvedValue({ data: response })
    const result = await taxApi.collect()
    expect(mockPost).toHaveBeenCalledWith('/tax/collect')
    expect(result).toEqual(response)
  })
})
