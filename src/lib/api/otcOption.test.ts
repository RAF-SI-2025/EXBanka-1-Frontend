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

  it('synthesises initiator from flat seller_id (bank-typed listing)', async () => {
    // The single-offer endpoint sometimes returns a flat seller representation
    // instead of a nested initiator object. The page's `isPoster` check is
    // viewer-type gated against initiator.owner_type, so the field must
    // always be present and typed.
    mockGet.mockResolvedValue({
      data: {
        offer: { id: 1001, status: 'open', ticker: 'AAPL', seller_id: 'bank-0' },
      },
    })
    const result = await getOtcOptionOffer(1001)
    expect(result.offer.initiator).toEqual({ owner_type: 'bank', owner_id: 0 })
  })

  it('keeps initiator unchanged when the backend already provides it', async () => {
    mockGet.mockResolvedValue({
      data: {
        offer: {
          ...createMockOtcOptionOffer(),
          initiator: { owner_type: 'bank', owner_id: null },
        },
      },
    })
    const result = await getOtcOptionOffer(1001)
    expect(result.offer.initiator).toEqual({ owner_type: 'bank', owner_id: null })
  })
})

describe('getMyOtcOptionOffers', () => {
  it('GET /me/otc/options', async () => {
    mockGet.mockResolvedValue({ data: { offers: [createMockOtcOptionOffer()], total: 1 } })
    await getMyOtcOptionOffers({ role: 'initiator' })
    expect(mockGet).toHaveBeenCalledWith('/me/otc/options', { params: { role: 'initiator' } })
  })

  it('also maps `amount` → `quantity` so the table renders identically to the All tab', async () => {
    mockGet.mockResolvedValue({
      data: { offers: [{ id: 7, ticker: 'AAPL', amount: 25 }], total: 1 },
    })
    const result = await getMyOtcOptionOffers()
    expect(result.offers[0]).toMatchObject({ quantity: '25' })
  })

  it('preserves ticker when present in the response', async () => {
    mockGet.mockResolvedValue({
      data: { offers: [{ id: 7, ticker: 'TSLA', quantity: '5', stock_id: 99 }], total: 1 },
    })
    const result = await getMyOtcOptionOffers()
    expect(result.offers[0]?.ticker).toBe('TSLA')
  })

  it('deduplicates duplicate rows by id', async () => {
    mockGet.mockResolvedValue({
      data: {
        offers: [
          { id: 7, ticker: 'TSLA' },
          { id: 7, ticker: 'TSLA' },
        ],
        total: 2,
      },
    })
    const result = await getMyOtcOptionOffers()
    expect(result.offers).toHaveLength(1)
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

  it('defaults missing status to "open" so the status column renders', async () => {
    // /otc/options entries omit the status field — the view is implicitly
    // open-only. Surface a sensible default so the UI doesn't show a blank
    // status cell.
    mockGet.mockResolvedValue({
      data: {
        offers: [{ id: 1, ticker: 'AAPL', quantity: '10' }],
        total_count: 1,
      },
    })
    const result = await getAllOtcOptionOffers()
    expect(result.offers[0]).toMatchObject({ ticker: 'AAPL', status: 'open' })
  })

  it('passes through existing status when present', async () => {
    mockGet.mockResolvedValue({
      data: { offers: [{ id: 2, status: 'consumed', ticker: 'TSLA' }], total_count: 1 },
    })
    const result = await getAllOtcOptionOffers()
    expect(result.offers[0]?.status).toBe('consumed')
  })

  it('maps `amount` (number) to `quantity` (string) for the All-tab shape', async () => {
    // /otc/options returns numeric `amount`; OtcOffer / the table expect
    // string `quantity`. Normalize to keep one table component rendering
    // both endpoints consistently.
    mockGet.mockResolvedValue({
      data: {
        offers: [{ offer_id: '42', ticker: 'AAPL', amount: 50 }],
        total_count: 1,
      },
    })
    const result = await getAllOtcOptionOffers()
    expect(result.offers[0]).toMatchObject({ quantity: '50' })
  })

  it('maps `offer_id` (string) to numeric `id` for the All-tab shape', async () => {
    mockGet.mockResolvedValue({
      data: { offers: [{ offer_id: '42', ticker: 'AAPL', amount: 50 }], total_count: 1 },
    })
    const result = await getAllOtcOptionOffers()
    expect(result.offers[0]?.id).toBe(42)
  })

  it('preserves `quantity` when it is already a string (Me-shape passthrough)', async () => {
    mockGet.mockResolvedValue({
      data: { offers: [{ id: 1, ticker: 'AAPL', quantity: '10' }], total_count: 1 },
    })
    const result = await getAllOtcOptionOffers()
    expect(result.offers[0]?.quantity).toBe('10')
  })

  it('parses "client-7" style seller_id into an initiator party', async () => {
    // /otc/options discovery returns `seller_id` as a string like "client-7"
    // and no `initiator` object. The Action column needs initiator.owner_id
    // to gate the Bid button, so synthesise it here.
    mockGet.mockResolvedValue({
      data: {
        offers: [{ offer_id: '42', ticker: 'AAPL', amount: 50, seller_id: 'client-7' }],
        total_count: 1,
      },
    })
    const result = await getAllOtcOptionOffers()
    expect(result.offers[0]?.initiator).toEqual({ owner_type: 'client', owner_id: 7 })
  })

  it('always synthesises an initiator (never undefined) so consumers can rely on it', async () => {
    mockGet.mockResolvedValue({
      data: { offers: [{ offer_id: '42', ticker: 'AAPL', amount: 50 }], total_count: 1 },
    })
    const result = await getAllOtcOptionOffers()
    expect(result.offers[0]?.initiator).toBeDefined()
    expect(result.offers[0]?.initiator.owner_id).toBeNull()
  })

  it('deduplicates offers that share the same id (keeps the first occurrence)', async () => {
    mockGet.mockResolvedValue({
      data: {
        offers: [
          { id: 7, ticker: 'AAPL', quantity: '10' },
          { id: 7, ticker: 'AAPL', quantity: '10' },
          { id: 8, ticker: 'TSLA', quantity: '5' },
        ],
        total_count: 3,
      },
    })
    const result = await getAllOtcOptionOffers()
    expect(result.offers).toHaveLength(2)
    expect(result.offers.map((o) => o.id)).toEqual([7, 8])
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

  it('synthesises a bidder party when the backend omits one', async () => {
    // OtcOfferDetailPage crashed reading `n.bidder.owner_id` because some
    // rows arrived without a `bidder` object. Always guarantee one.
    mockGet.mockResolvedValue({
      data: { negotiations: [{ id: 1, status: 'open' }], total: 1 },
    })
    const result = await getOtcOptionNegotiations(1001)
    expect(result.negotiations[0]?.bidder).toBeDefined()
    expect(result.negotiations[0]?.last_action_by).toBeDefined()
  })

  it('parses flat bidder_id "client-7" into a bidder party', async () => {
    mockGet.mockResolvedValue({
      data: { negotiations: [{ id: 1, status: 'open', bidder_id: 'client-7' }], total: 1 },
    })
    const result = await getOtcOptionNegotiations(1001)
    expect(result.negotiations[0]?.bidder).toEqual({ owner_type: 'client', owner_id: 7 })
  })

  it('canonicalises legacy uppercase statuses (PENDING → open, COUNTERED → countered)', async () => {
    // Action gating in the page checks lowercase 'open'/'countered'; if the
    // backend returns the legacy uppercase variants the buttons silently
    // disappear. Force canonical lowercase form.
    mockGet.mockResolvedValue({
      data: {
        negotiations: [
          { id: 1, status: 'PENDING' },
          { id: 2, status: 'COUNTERED' },
          { id: 3, status: 'open' },
        ],
        total: 3,
      },
    })
    const result = await getOtcOptionNegotiations(1001)
    expect(result.negotiations.map((n) => n.status)).toEqual([
      'open',
      'countered',
      'open',
    ])
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
