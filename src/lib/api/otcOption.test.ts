import { apiClient } from '@/lib/api/axios'
import {
  createOtcOptionOffer,
  counterOtcOptionOffer,
  acceptOtcOptionOffer,
  rejectOtcOptionOffer,
  getOtcOptionOffer,
  getMyOtcOptionOffers,
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
  it('POST /otc/offers', async () => {
    mockPost.mockResolvedValue({ data: { offer: createMockOtcOptionOffer() } })
    await createOtcOptionOffer({
      direction: 'sell_initiated',
      stock_id: 42,
      quantity: '100',
      strike_price: '5000.00',
      premium: '50000.00',
      settlement_date: '2026-06-05',
    })
    expect(mockPost).toHaveBeenCalledWith(
      '/otc/offers',
      expect.objectContaining({ direction: 'sell_initiated' })
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
  it('POST /otc/offers/:id/accept', async () => {
    mockPost.mockResolvedValue({
      data: { offer: createMockOtcOptionOffer(), contract: createMockOptionContract() },
    })
    await acceptOtcOptionOffer(1001, { buyer_account_id: 5, seller_account_id: 9 })
    expect(mockPost).toHaveBeenCalledWith('/otc/offers/1001/accept', {
      buyer_account_id: 5,
      seller_account_id: 9,
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
    await exerciseOtcOptionContract(5001, { buyer_account_id: 5, seller_account_id: 9 })
    expect(mockPost).toHaveBeenCalledWith('/otc/contracts/5001/exercise', {
      buyer_account_id: 5,
      seller_account_id: 9,
    })
  })
})
