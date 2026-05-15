import { apiClient } from '@/lib/api/axios'
import {
  createOtcOptionOffer,
  counterOtcOptionOffer,
  acceptOtcOptionOffer,
  rejectOtcOptionOffer,
  getOtcOptionOffer,
  getMyOtcOptionOffers,
  getAllOtcOptionOffers,
  getOtcOptionContract,
  getMyOtcOptionContracts,
  exerciseOtcOptionContract,
} from '@/lib/api/otcOption'
import {
  createMockOtcOptionOffer,
  createMockOptionContract,
  createMockOtcOfferRevision,
} from '@/__tests__/fixtures/otcOption-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('createOtcOptionOffer', () => {
  it('POST /otc/offers with ticker + account_id (no stock_id in request)', async () => {
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
    expect(mockPost).toHaveBeenCalledWith('/otc/offers', {
      direction: 'sell_initiated',
      ticker: 'AAPL',
      quantity: '100',
      strike_price: '5000.00',
      premium: '50000.00',
      settlement_date: '2026-06-05',
      account_id: 4242,
    })
  })

  it('forwards on_behalf_of_client_id when supplied (employee acting for client)', async () => {
    mockPost.mockResolvedValue({ data: { offer: createMockOtcOptionOffer() } })
    await createOtcOptionOffer({
      direction: 'buy_initiated',
      ticker: 'TSLA',
      quantity: '10',
      strike_price: '200.00',
      settlement_date: '2026-07-01',
      account_id: 99,
      on_behalf_of_client_id: 7,
    })
    expect(mockPost).toHaveBeenCalledWith(
      '/otc/offers',
      expect.objectContaining({ ticker: 'TSLA', on_behalf_of_client_id: 7 })
    )
  })
})

describe('counterOtcOptionOffer', () => {
  it('POST /otc/offers/:id/counter', async () => {
    mockPost.mockResolvedValue({ data: { offer: createMockOtcOptionOffer() } })
    await counterOtcOptionOffer(1001, { premium: '52000' })
    expect(mockPost).toHaveBeenCalledWith('/otc/offers/1001/counter', { premium: '52000' })
  })
})

describe('acceptOtcOptionOffer', () => {
  it('POST /otc/offers/:id/accept with acceptor account_id only', async () => {
    mockPost.mockResolvedValue({
      data: { offer: createMockOtcOptionOffer(), contract: createMockOptionContract() },
    })
    await acceptOtcOptionOffer(1001, { account_id: 5 })
    expect(mockPost).toHaveBeenCalledWith('/otc/offers/1001/accept', { account_id: 5 })
  })

  it('forwards on_behalf_of_client_id when supplied', async () => {
    mockPost.mockResolvedValue({
      data: { offer: createMockOtcOptionOffer(), contract: createMockOptionContract() },
    })
    await acceptOtcOptionOffer(1001, { account_id: 5, on_behalf_of_client_id: 7 })
    expect(mockPost).toHaveBeenCalledWith('/otc/offers/1001/accept', {
      account_id: 5,
      on_behalf_of_client_id: 7,
    })
  })
})

describe('rejectOtcOptionOffer', () => {
  it('POST /otc/offers/:id/reject (no body)', async () => {
    mockPost.mockResolvedValue({ data: { offer: createMockOtcOptionOffer() } })
    await rejectOtcOptionOffer(1001)
    expect(mockPost).toHaveBeenCalledWith('/otc/offers/1001/reject')
  })
})

describe('getOtcOptionOffer', () => {
  it('GET /otc/offers/:id with revisions', async () => {
    mockGet.mockResolvedValue({
      data: { offer: createMockOtcOptionOffer(), revisions: [createMockOtcOfferRevision()] },
    })
    const result = await getOtcOptionOffer(1001)
    expect(mockGet).toHaveBeenCalledWith('/otc/offers/1001')
    expect(result.revisions).toHaveLength(1)
  })

  it('defaults revisions[] to []', async () => {
    mockGet.mockResolvedValue({
      data: { offer: createMockOtcOptionOffer(), revisions: null },
    })
    const result = await getOtcOptionOffer(1001)
    expect(result.revisions).toEqual([])
  })
})

describe('getMyOtcOptionOffers', () => {
  it('GET /me/otc/offers with role filter', async () => {
    mockGet.mockResolvedValue({ data: { offers: [createMockOtcOptionOffer()], total: 1 } })
    await getMyOtcOptionOffers({ role: 'initiator' })
    expect(mockGet).toHaveBeenCalledWith('/me/otc/offers', {
      params: { role: 'initiator' },
    })
  })
})

describe('getAllOtcOptionOffers', () => {
  it('GET /otc/offers (no role filter, returns every offer)', async () => {
    mockGet.mockResolvedValue({ data: { offers: [createMockOtcOptionOffer()], total: 1 } })
    await getAllOtcOptionOffers()
    expect(mockGet).toHaveBeenCalledWith('/otc/offers', { params: {} })
  })

  it('forwards pagination filters', async () => {
    mockGet.mockResolvedValue({ data: { offers: [], total: 0 } })
    await getAllOtcOptionOffers({ page: 2, page_size: 50 })
    expect(mockGet).toHaveBeenCalledWith('/otc/offers', {
      params: { page: 2, page_size: 50 },
    })
  })

  it('defaults offers[] to []', async () => {
    mockGet.mockResolvedValue({ data: { offers: null, total: 0 } })
    const result = await getAllOtcOptionOffers()
    expect(result.offers).toEqual([])
  })
})

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
  it('POST /otc/contracts/:id/exercise with empty body (accounts read from contract)', async () => {
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

  it('forwards on_behalf_of_client_id when supplied', async () => {
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
    await exerciseOtcOptionContract(5001, { on_behalf_of_client_id: 7 })
    expect(mockPost).toHaveBeenCalledWith('/otc/contracts/5001/exercise', {
      on_behalf_of_client_id: 7,
    })
  })
})
