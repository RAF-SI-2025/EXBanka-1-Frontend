import { apiClient } from '@/lib/api/axios'
import { getOtcOffers, buyOtcOffer, buyOtcOfferOnBehalf } from '@/lib/api/otc'
import type { OtcOfferListResponse } from '@/types/otc'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('getOtcOffers', () => {
  it('GET /api/otc/offers returns offers', async () => {
    const mockData: OtcOfferListResponse = { offers: [], total_count: 0 }
    mockGet.mockResolvedValue({ data: mockData })

    const result = await getOtcOffers()

    expect(mockGet).toHaveBeenCalledWith('/otc/offers', {
      params: expect.any(URLSearchParams),
    })
    expect(result).toEqual(mockData)
  })

  it('passes ticker and security_type as query params', async () => {
    mockGet.mockResolvedValue({ data: { offers: [], total_count: 0 } })
    await getOtcOffers({ ticker: 'AAPL', security_type: 'stock' })
    const params: URLSearchParams = mockGet.mock.calls[0]![1]!.params
    expect(params.get('ticker')).toBe('AAPL')
    expect(params.get('security_type')).toBe('stock')
  })
})

describe('buyOtcOffer', () => {
  it('POST /api/otc/offers/:id/buy with payload', async () => {
    mockPost.mockResolvedValue({ data: {} })

    await buyOtcOffer(3, { quantity: 2, account_id: 42 })

    expect(mockPost).toHaveBeenCalledWith('/otc/offers/3/buy', {
      quantity: 2,
      account_id: 42,
    })
  })
})

describe('buyOtcOfferOnBehalf', () => {
  it('POST /api/otc/offers/:id/buy-on-behalf with payload', async () => {
    mockPost.mockResolvedValue({ data: {} })

    await buyOtcOfferOnBehalf(7, { client_id: 5, account_id: 12, quantity: 3 })

    expect(mockPost).toHaveBeenCalledWith('/otc/offers/7/buy-on-behalf', {
      client_id: 5,
      account_id: 12,
      quantity: 3,
    })
  })
})
