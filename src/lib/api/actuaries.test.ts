import { apiClient } from '@/lib/api/axios'
import {
  getActuaries,
  setActuaryLimit,
  resetActuaryLimit,
  setActuaryApproval,
} from '@/lib/api/actuaries'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)

beforeEach(() => jest.clearAllMocks())

describe('getActuaries', () => {
  it('fetches actuaries with filters', async () => {
    const response = { actuaries: [createMockActuary()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getActuaries({ search: 'Smith', page: 1, page_size: 10 })

    expect(mockGet).toHaveBeenCalledWith('/api/actuaries', {
      params: { search: 'Smith', page: 1, page_size: 10 },
    })
    expect(result).toEqual(response)
  })

  it('fetches actuaries with no filters', async () => {
    const response = { actuaries: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getActuaries()

    expect(mockGet).toHaveBeenCalledWith('/api/actuaries', { params: {} })
    expect(result).toEqual(response)
  })
})

describe('setActuaryLimit', () => {
  it('sends PUT with limit payload', async () => {
    const actuary = createMockActuary({ limit: '200000.00' })
    mockPut.mockResolvedValue({ data: actuary })

    const result = await setActuaryLimit(1, { limit: '200000.00' })

    expect(mockPut).toHaveBeenCalledWith('/api/actuaries/1/limit', { limit: '200000.00' })
    expect(result).toEqual(actuary)
  })
})

describe('resetActuaryLimit', () => {
  it('sends POST to reset limit', async () => {
    const actuary = createMockActuary({ used_limit: '0' })
    mockPost.mockResolvedValue({ data: actuary })

    const result = await resetActuaryLimit(1)

    expect(mockPost).toHaveBeenCalledWith('/api/actuaries/1/reset-limit')
    expect(result).toEqual(actuary)
  })
})

describe('setActuaryApproval', () => {
  it('sends PUT with need_approval payload', async () => {
    const actuary = createMockActuary({ need_approval: false })
    mockPut.mockResolvedValue({ data: actuary })

    const result = await setActuaryApproval(1, { need_approval: false })

    expect(mockPut).toHaveBeenCalledWith('/api/actuaries/1/approval', { need_approval: false })
    expect(result).toEqual(actuary)
  })
})
