import { apiClient } from '@/lib/api/axios'
import {
  getOtcOffers,
  buyOtcOffer,
  buyOtcOfferOnBehalf,
  createPeerOtcNegotiation,
} from '@/lib/api/otc'
import { createMockOtcOfferListResponse } from '@/__tests__/fixtures/otc-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('getOtcOffers', () => {
  it('GET /api/otc/offers returns offers and peer-status fields', async () => {
    const mockData = createMockOtcOfferListResponse({ offers: [] })
    mockGet.mockResolvedValue({ data: mockData })

    const result = await getOtcOffers()

    expect(mockGet).toHaveBeenCalledWith('/otc/offers', {
      params: expect.any(URLSearchParams),
    })
    expect(result).toEqual(mockData)
  })

  it('passes ticker, security_type, kind, and bank_code as query params', async () => {
    mockGet.mockResolvedValue({ data: createMockOtcOfferListResponse({ offers: [] }) })
    await getOtcOffers({
      ticker: 'AAPL',
      security_type: 'stock',
      kind: 'remote',
      bank_code: '333',
    })
    const params: URLSearchParams = mockGet.mock.calls[0]![1]!.params
    expect(params.get('ticker')).toBe('AAPL')
    expect(params.get('security_type')).toBe('stock')
    expect(params.get('kind')).toBe('remote')
    expect(params.get('bank_code')).toBe('333')
  })

  it('fills missing peer-status fields with safe defaults', async () => {
    mockGet.mockResolvedValue({ data: { offers: [], total_count: 0 } })
    const result = await getOtcOffers()
    expect(result).toEqual({
      offers: [],
      total_count: 0,
      peers_total: 0,
      peers_reached: 0,
      partial: false,
      last_refresh: '',
    })
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

describe('createPeerOtcNegotiation', () => {
  it('POST /me/peer-otc/negotiations with the negotiation payload', async () => {
    const responseBody = { routingNumber: 333, id: 'neg-1' }
    mockPost.mockResolvedValue({ data: responseBody })

    const payload = {
      seller_bank_code: '333',
      seller_id: '0',
      stock: { ticker: 'MSFT' },
      amount: 2,
      settlement_date: '2027-08-01T00:00:00.000Z',
      price_per_unit: { amount: '175', currency: 'USD' },
      premium: { amount: '40', currency: 'USD' },
    }
    const result = await createPeerOtcNegotiation(payload)

    expect(mockPost).toHaveBeenCalledWith('/me/peer-otc/negotiations', payload)
    expect(result).toEqual(responseBody)
  })
})
