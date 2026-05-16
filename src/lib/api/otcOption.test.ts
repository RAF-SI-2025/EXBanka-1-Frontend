import { apiClient } from '@/lib/api/axios'
import {
  createOtcOptionOffer,
  getOtcOptionOffer,
  getMyOtcOptionOffers,
  getAllOtcOptionOffers,
  placeBidOnOtcOption,
  getOtcOptionNegotiations,
  getMyOtcOptionNegotiations,
  counterOtcNegotiation,
  acceptOtcNegotiation,
  rejectOtcNegotiation,
  cancelOtcNegotiation,
  getOtcOptionContract,
  getMyOtcOptionContracts,
  exerciseOtcOptionContract,
} from '@/lib/api/otcOption'
import {
  createMockOtcOptionOffer,
  createMockOptionContract,
} from '@/__tests__/fixtures/otcOption-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockDelete = jest.mocked(apiClient.delete)

beforeEach(() => jest.clearAllMocks())

// -- Listings ---------------------------------------------------------------

describe('createOtcOptionOffer', () => {
  it('POST /me/otc/options with ticker + account_id', async () => {
    mockPost.mockResolvedValue({ data: { offer: createMockOtcOptionOffer() } })
    await createOtcOptionOffer({
      direction: 'sell_initiated',
      ticker: 'AAPL',
      quantity: '100',
      strike_price: '5000.00',
      premium: '50000.00',
      settlement_date: '2026-06-05',
      account_id: 4242,
    })
    expect(mockPost).toHaveBeenCalledWith(
      '/me/otc/options',
      expect.objectContaining({ ticker: 'AAPL', account_id: 4242 })
    )
  })
})

describe('getOtcOptionOffer', () => {
  it('GET /otc/options/:id', async () => {
    mockGet.mockResolvedValue({ data: { offer: createMockOtcOptionOffer() } })
    await getOtcOptionOffer(1001)
    expect(mockGet).toHaveBeenCalledWith('/otc/options/1001')
  })
})

describe('getMyOtcOptionOffers', () => {
  it('GET /me/otc/options', async () => {
    mockGet.mockResolvedValue({ data: { offers: [createMockOtcOptionOffer()], total: 1 } })
    await getMyOtcOptionOffers({ role: 'initiator' })
    expect(mockGet).toHaveBeenCalledWith('/me/otc/options', { params: { role: 'initiator' } })
  })
})

describe('getAllOtcOptionOffers', () => {
  it('GET /otc/options', async () => {
    mockGet.mockResolvedValue({ data: { offers: [createMockOtcOptionOffer()], total: 1 } })
    await getAllOtcOptionOffers()
    expect(mockGet).toHaveBeenCalledWith('/otc/options', { params: {} })
  })

  it('forwards filters', async () => {
    mockGet.mockResolvedValue({ data: { offers: [], total: 0 } })
    await getAllOtcOptionOffers({ ticker: 'AAPL', kind: 'local', page: 2 })
    expect(mockGet).toHaveBeenCalledWith('/otc/options', {
      params: { ticker: 'AAPL', kind: 'local', page: 2 },
    })
  })
})

// -- Negotiation chains -----------------------------------------------------

describe('placeBidOnOtcOption', () => {
  it('POST /otc/options/:id/bid', async () => {
    mockPost.mockResolvedValue({
      data: {
        negotiation: {
          id: 1,
          offer_id: 1001,
          status: 'open',
          bidder: { owner_type: 'client', owner_id: 7 },
          last_action_by: { owner_type: 'client', owner_id: 7 },
          quantity: '100',
          strike_price: '180.00',
          premium: '500.00',
          settlement_date: '2026-06-05',
          created_at: '2026-05-16T03:00:00Z',
          updated_at: '2026-05-16T03:00:00Z',
        },
      },
    })
    await placeBidOnOtcOption(1001, {
      bidder_account_id: 42,
      quantity: '100',
      strike_price: '180.00',
      premium: '500.00',
      settlement_date: '2026-06-05',
    })
    expect(mockPost).toHaveBeenCalledWith('/otc/options/1001/bid', {
      bidder_account_id: 42,
      quantity: '100',
      strike_price: '180.00',
      premium: '500.00',
      settlement_date: '2026-06-05',
    })
  })
})

describe('getOtcOptionNegotiations', () => {
  it('GET /otc/options/:id/negotiations', async () => {
    mockGet.mockResolvedValue({ data: { negotiations: [], total: 0 } })
    await getOtcOptionNegotiations(1001)
    expect(mockGet).toHaveBeenCalledWith('/otc/options/1001/negotiations')
  })

  it('defaults negotiations[] to []', async () => {
    mockGet.mockResolvedValue({ data: { negotiations: null, total: 0 } })
    const result = await getOtcOptionNegotiations(1001)
    expect(result.negotiations).toEqual([])
  })
})

describe('getMyOtcOptionNegotiations', () => {
  it('GET /me/otc/options/negotiations with statuses filter', async () => {
    mockGet.mockResolvedValue({ data: { negotiations: [], total: 0 } })
    await getMyOtcOptionNegotiations({ statuses: 'open,countered' })
    expect(mockGet).toHaveBeenCalledWith('/me/otc/options/negotiations', {
      params: { statuses: 'open,countered' },
    })
  })
})

describe('counterOtcNegotiation', () => {
  it('POST /me/otc/options/:id/negotiations/:nid/counter', async () => {
    mockPost.mockResolvedValue({ data: { negotiation: {} } })
    await counterOtcNegotiation(1001, 5, { premium: '52000' })
    expect(mockPost).toHaveBeenCalledWith('/me/otc/options/1001/negotiations/5/counter', {
      premium: '52000',
    })
  })
})

describe('acceptOtcNegotiation', () => {
  it('POST /me/otc/options/:id/negotiations/:nid/accept with acceptor_account_id', async () => {
    mockPost.mockResolvedValue({
      data: {
        winning: {},
        parent_offer_id: 1001,
        parent_status: 'consumed',
        cancelled_siblings: [],
        contract: createMockOptionContract(),
      },
    })
    await acceptOtcNegotiation(1001, 5, { acceptor_account_id: 42 })
    expect(mockPost).toHaveBeenCalledWith('/me/otc/options/1001/negotiations/5/accept', {
      acceptor_account_id: 42,
    })
  })
})

describe('rejectOtcNegotiation', () => {
  it('POST /me/otc/options/:id/negotiations/:nid/reject (no body)', async () => {
    mockPost.mockResolvedValue({ data: { negotiation: {} } })
    await rejectOtcNegotiation(1001, 5)
    expect(mockPost).toHaveBeenCalledWith('/me/otc/options/1001/negotiations/5/reject')
  })
})

describe('cancelOtcNegotiation', () => {
  it('DELETE /me/otc/options/:id/negotiations/:nid', async () => {
    mockDelete.mockResolvedValue({ data: {} })
    await cancelOtcNegotiation(1001, 5)
    expect(mockDelete).toHaveBeenCalledWith('/me/otc/options/1001/negotiations/5')
  })
})

// -- Contracts (unchanged routes) -------------------------------------------

describe('getOtcOptionContract', () => {
  it('GET /otc/contracts/:id', async () => {
    mockGet.mockResolvedValue({ data: { contract: createMockOptionContract() } })
    await getOtcOptionContract(5001)
    expect(mockGet).toHaveBeenCalledWith('/otc/contracts/5001')
  })
})

describe('getMyOtcOptionContracts', () => {
  it('GET /me/otc/contracts with role filter', async () => {
    mockGet.mockResolvedValue({ data: { contracts: [createMockOptionContract()], total: 1 } })
    await getMyOtcOptionContracts({ role: 'buyer' })
    expect(mockGet).toHaveBeenCalledWith('/me/otc/contracts', { params: { role: 'buyer' } })
  })
})

describe('exerciseOtcOptionContract', () => {
  it('POST /otc/contracts/:id/exercise', async () => {
    mockPost.mockResolvedValue({
      data: {
        contract: createMockOptionContract({ status: 'EXERCISED' }),
        holding: {
          id: 9001,
          stock_id: 42,
          quantity: '100',
          owner: { owner_type: 'client', owner_id: 7 },
        },
      },
    })
    await exerciseOtcOptionContract(5001, {})
    expect(mockPost).toHaveBeenCalledWith('/otc/contracts/5001/exercise', {})
  })
})
