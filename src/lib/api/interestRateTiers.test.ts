import { apiClient } from '@/lib/api/axios'
import {
  getInterestRateTiers,
  createTier,
  updateTier,
  deleteTier,
  applyTier,
} from '@/lib/api/interestRateTiers'
import type { InterestRateTier, CreateTierPayload } from '@/types/interestRateTiers'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)
const mockDelete = jest.mocked(apiClient.delete)

beforeEach(() => jest.clearAllMocks())

describe('getInterestRateTiers', () => {
  it('GET /api/interest-rate-tiers returns tiers', async () => {
    const mockData = {
      tiers: [{ id: 1, amount_from: 0, amount_to: 50000, fixed_rate: 5.5, variable_base: 3.0 }],
    }
    mockGet.mockResolvedValue({ data: mockData })

    const result = await getInterestRateTiers()

    expect(mockGet).toHaveBeenCalledWith('/api/v1/interest-rate-tiers')
    expect(result).toEqual(mockData)
  })
})

describe('createTier', () => {
  it('POST /api/interest-rate-tiers creates a tier', async () => {
    const payload: CreateTierPayload = {
      amount_from: 0,
      amount_to: 50000,
      fixed_rate: 5.5,
      variable_base: 3.0,
    }
    const created: InterestRateTier = {
      id: 1,
      ...payload,
      active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    mockPost.mockResolvedValue({ data: created })

    const result = await createTier(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/v1/interest-rate-tiers', payload)
    expect(result).toEqual(created)
  })
})

describe('updateTier', () => {
  it('PUT /api/interest-rate-tiers/:id updates a tier', async () => {
    const updated: InterestRateTier = {
      id: 1,
      amount_from: 0,
      amount_to: 50000,
      fixed_rate: 6.0,
      variable_base: 3.0,
      active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    mockPut.mockResolvedValue({ data: updated })

    const payload: CreateTierPayload = {
      amount_from: 0,
      amount_to: 50000,
      fixed_rate: 6.0,
      variable_base: 3.0,
    }
    const result = await updateTier(1, payload)

    expect(mockPut).toHaveBeenCalledWith('/api/v1/interest-rate-tiers/1', payload)
    expect(result).toEqual(updated)
  })
})

describe('deleteTier', () => {
  it('DELETE /api/interest-rate-tiers/:id deletes a tier', async () => {
    mockDelete.mockResolvedValue({ data: undefined })

    await deleteTier(1)

    expect(mockDelete).toHaveBeenCalledWith('/api/v1/interest-rate-tiers/1')
  })
})

describe('applyTier', () => {
  it('POST /api/interest-rate-tiers/:id/apply applies variable rate update', async () => {
    const response = { updated: 3 }
    mockPost.mockResolvedValue({ data: response })

    const result = await applyTier(1)

    expect(mockPost).toHaveBeenCalledWith('/api/v1/interest-rate-tiers/1/apply')
    expect(result).toEqual(response)
  })
})
