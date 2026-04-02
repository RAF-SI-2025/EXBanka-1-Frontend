import { apiClient } from '@/lib/api/axios'
import { getTaxRecords, collectTaxes } from '@/lib/api/tax'
import type { TaxListResponse, TaxCollectResponse } from '@/types/tax'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('getTaxRecords', () => {
  it('GET /api/tax returns tax records', async () => {
    const mockData: TaxListResponse = { tax_records: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: mockData })

    const result = await getTaxRecords()

    expect(mockGet).toHaveBeenCalledWith('/api/tax', { params: expect.any(URLSearchParams) })
    expect(result).toEqual(mockData)
  })

  it('passes user_type, search, page as query params', async () => {
    mockGet.mockResolvedValue({ data: { tax_records: [], total_count: 0 } })
    await getTaxRecords({ user_type: 'client', search: 'Marko', page: 2 })
    const params: URLSearchParams = mockGet.mock.calls[0]![1]!.params
    expect(params.get('user_type')).toBe('client')
    expect(params.get('search')).toBe('Marko')
    expect(params.get('page')).toBe('2')
  })
})

describe('collectTaxes', () => {
  it('POST /api/tax/collect returns collection result', async () => {
    const mockData: TaxCollectResponse = {
      collected_count: 5,
      total_collected_rsd: '25000.00',
      failed_count: 0,
    }
    mockPost.mockResolvedValue({ data: mockData })

    const result = await collectTaxes()

    expect(mockPost).toHaveBeenCalledWith('/api/tax/collect')
    expect(result).toEqual(mockData)
  })
})
