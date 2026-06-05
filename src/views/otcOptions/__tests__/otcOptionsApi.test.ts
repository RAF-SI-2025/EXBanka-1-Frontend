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

  it('forwards the kind and bank_code discovery filters', async () => {
    mockGet.mockResolvedValue({ data: { offers: [], total_count: 0 } })

    await otcOptionsApi.listAll({ kind: 'remote', bank_code: '222', page: 1 })

    expect(mockGet).toHaveBeenCalledWith('/otc/options', {
      params: { kind: 'remote', bank_code: '222', page: 1 },
    })
  })
})

describe('otcOptionsApi.listMine', () => {
  it('GETs /me/otc/options and returns the marketplace discovery shape', async () => {
    const payload = {
      offers: [
        {
          kind: 'local',
          bank_code: '111',
          routing_number: 111,
          offer_id: '77',
          seller_id: 'client-5',
          direction: 'sell_initiated',
          ticker: 'TSLA',
          amount: 5,
          strike_price: '300',
          strike_currency: 'USD',
          premium: '500',
          premium_currency: 'USD',
          settlement_date: '2026-12-31T00:00:00Z',
          created_at: '2026-05-10T14:00:00Z',
          active_chains_count: 0,
        },
      ],
      total_count: 1,
    }
    mockGet.mockResolvedValue({ data: payload })

    const result = await otcOptionsApi.listMine({ page: 1, page_size: 20 })

    expect(mockGet).toHaveBeenCalledWith('/me/otc/options', {
      params: { page: 1, page_size: 20 },
    })
    expect(result).toEqual(payload)
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

  it('forwards on_behalf_of_fund_id for a fund-manager accept', async () => {
    mockPost.mockResolvedValue({ data: { winning: { id: 7, status: 'accepted' } } })

    await otcOptionsApi.acceptNegotiation(42, 7, {
      acceptor_account_id: 5,
      on_behalf_of_fund_id: 101,
    })

    expect(mockPost).toHaveBeenCalledWith('/me/otc/options/42/negotiations/7/accept', {
      acceptor_account_id: 5,
      on_behalf_of_fund_id: 101,
    })
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

describe('otcOptionsApi.getOfferTimeline', () => {
  it('GETs /otc/options/:id/timeline and returns the merged stream', async () => {
    const timeline = [
      {
        negotiation_id: 100,
        bidder_owner_type: 'client',
        bidder_owner_id: 7,
        revision_number: 1,
        action: 'BID',
        quantity: '10',
        strike_price: '150.00',
        premium: '5.00',
        settlement_date: '2026-07-01T00:00:00Z',
        action_by_principal_type: 'client',
        action_by_principal_id: 7,
        created_at: '2026-06-01T12:00:00Z',
      },
    ]
    mockGet.mockResolvedValue({ data: { offer: { offer_id: '42' }, timeline } })

    const result = await otcOptionsApi.getOfferTimeline(42)

    expect(mockGet).toHaveBeenCalledWith('/otc/options/42/timeline')
    expect(result.timeline).toEqual(timeline)
  })

  it('defaults a missing timeline to an empty array', async () => {
    mockGet.mockResolvedValue({ data: { offer: {} } })

    const result = await otcOptionsApi.getOfferTimeline(42)

    expect(result.timeline).toEqual([])
  })
})

describe('otcOptionsApi.cancelListing', () => {
  it('DELETEs the owner-listing', async () => {
    mockDelete.mockResolvedValue({ data: undefined })

    await otcOptionsApi.cancelListing(42)

    expect(mockDelete).toHaveBeenCalledWith('/me/otc/options/42')
  })
})

describe('otcOptionsApi.listNegotiationRevisions', () => {
  it('GETs /me/otc/options/negotiations/:nid/revisions', async () => {
    const revisions = [
      {
        id: 1,
        negotiation_id: 5,
        revision_number: 1,
        action: 'BID',
        quantity: '10',
        strike_price: '150.00',
        premium: '7.50',
        settlement_date: '2026-07-01T00:00:00Z',
        action_by_principal_type: 'client',
        action_by_principal_id: 42,
        created_at: '2026-06-01T12:00:00Z',
      },
    ]
    mockGet.mockResolvedValue({ data: { revisions } })

    const result = await otcOptionsApi.listNegotiationRevisions(5)

    expect(mockGet).toHaveBeenCalledWith('/me/otc/options/negotiations/5/revisions')
    expect(result.revisions).toEqual(revisions)
  })

  it('defaults missing revisions to an empty array', async () => {
    mockGet.mockResolvedValue({ data: {} })

    const result = await otcOptionsApi.listNegotiationRevisions(5)

    expect(result.revisions).toEqual([])
  })
})
