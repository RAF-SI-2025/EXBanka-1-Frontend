import { apiClient } from '@/lib/api/axios'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockDelete = jest.mocked(apiClient.delete)

beforeEach(() => jest.clearAllMocks())

describe('otcOptionsApi.listAll', () => {
  it('GETs /otc/options with filters and returns the discovery payload', async () => {
    const payload = {
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          offer_id: '42',
          seller_id: 'client-7',
          direction: 'sell_initiated',
          ticker: 'AAPL',
          amount: 10,
          strike_price: '175.50',
          strike_currency: 'USD',
          premium: '700.00',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          best_bid: '850',
          active_chains_count: 3,
        },
      ],
      total_count: 1,
      peers_total: 2,
      peers_reached: 2,
      partial: false,
      last_refresh: '2026-05-16T02:50:00Z',
    }
    mockGet.mockResolvedValue({ data: payload })

    const result = await otcOptionsApi.listAll({ ticker: 'AAPL', page: 1, page_size: 20 })

    expect(mockGet).toHaveBeenCalledWith('/otc/options', {
      params: { ticker: 'AAPL', page: 1, page_size: 20 },
    })
    expect(result).toEqual(payload)
  })
})

describe('otcOptionsApi.listMine', () => {
  it('GETs /me/otc/options', async () => {
    mockGet.mockResolvedValue({ data: { offers: [], total: 0 } })

    const result = await otcOptionsApi.listMine({ page: 1, page_size: 20 })

    expect(mockGet).toHaveBeenCalledWith('/me/otc/options', {
      params: { page: 1, page_size: 20 },
    })
    expect(result).toEqual({ offers: [], total: 0 })
  })
})

describe('otcOptionsApi.createListing', () => {
  it('POSTs /me/otc/options with payload and returns offer', async () => {
    mockPost.mockResolvedValue({ data: { offer: { id: 99 } } })

    const payload = {
      direction: 'sell_initiated' as const,
      ticker: 'AAPL',
      quantity: '10',
      strike_price: '175.50',
      premium: '700.00',
      settlement_date: '2026-12-31',
      account_id: 42,
    }
    const result = await otcOptionsApi.createListing(payload)

    expect(mockPost).toHaveBeenCalledWith('/me/otc/options', payload)
    expect(result).toEqual({ offer: { id: 99 } })
  })
})

describe('otcOptionsApi.placeBid', () => {
  it('POSTs /otc/options/:id/bid', async () => {
    mockPost.mockResolvedValue({ data: { negotiation: { id: 1, status: 'open' } } })

    const result = await otcOptionsApi.placeBid(42, {
      bidder_account_id: 5,
      quantity: '10',
      strike_price: '175.50',
      premium: '700.00',
      settlement_date: '2026-12-31',
    })

    expect(mockPost).toHaveBeenCalledWith('/otc/options/42/bid', {
      bidder_account_id: 5,
      quantity: '10',
      strike_price: '175.50',
      premium: '700.00',
      settlement_date: '2026-12-31',
    })
    expect(result.negotiation.id).toBe(1)
  })
})

describe('otcOptionsApi.counter', () => {
  it('POSTs /me/otc/options/:id/negotiations/:nid/counter', async () => {
    mockPost.mockResolvedValue({ data: { negotiation: { id: 7, status: 'countered' } } })

    const result = await otcOptionsApi.counter(42, 7, {
      quantity: '12',
      strike_price: '180',
      premium: '750',
      settlement_date: '2026-12-31',
    })

    expect(mockPost).toHaveBeenCalledWith('/me/otc/options/42/negotiations/7/counter', {
      quantity: '12',
      strike_price: '180',
      premium: '750',
      settlement_date: '2026-12-31',
    })
    expect(result.negotiation.status).toBe('countered')
  })
})

describe('otcOptionsApi.acceptNegotiation', () => {
  it('POSTs accept with acceptor_account_id', async () => {
    mockPost.mockResolvedValue({ data: { winning: { id: 7, status: 'accepted' } } })

    const result = await otcOptionsApi.acceptNegotiation(42, 7, { acceptor_account_id: 5 })

    expect(mockPost).toHaveBeenCalledWith('/me/otc/options/42/negotiations/7/accept', {
      acceptor_account_id: 5,
    })
    expect(result.winning.status).toBe('accepted')
  })
})

describe('otcOptionsApi.rejectNegotiation', () => {
  it('POSTs reject with no body', async () => {
    mockPost.mockResolvedValue({ data: { negotiation: { id: 7, status: 'rejected' } } })

    const result = await otcOptionsApi.rejectNegotiation(42, 7)

    expect(mockPost).toHaveBeenCalledWith('/me/otc/options/42/negotiations/7/reject')
    expect(result.negotiation.status).toBe('rejected')
  })
})

describe('otcOptionsApi.withdrawNegotiation', () => {
  it('DELETEs the caller-bidder chain', async () => {
    mockDelete.mockResolvedValue({ data: undefined })

    await otcOptionsApi.withdrawNegotiation(42, 7)

    expect(mockDelete).toHaveBeenCalledWith('/me/otc/options/42/negotiations/7')
  })
})

describe('otcOptionsApi.listNegotiations', () => {
  it('GETs /otc/options/:id/negotiations', async () => {
    mockGet.mockResolvedValue({ data: { negotiations: [{ id: 7 }], total: 1 } })

    const result = await otcOptionsApi.listNegotiations(42)

    expect(mockGet).toHaveBeenCalledWith('/otc/options/42/negotiations')
    expect(result.negotiations).toHaveLength(1)
  })
})

describe('otcOptionsApi.cancelListing', () => {
  it('DELETEs the owner-listing', async () => {
    mockDelete.mockResolvedValue({ data: undefined })

    await otcOptionsApi.cancelListing(42)

    expect(mockDelete).toHaveBeenCalledWith('/me/otc/options/42')
  })
})
