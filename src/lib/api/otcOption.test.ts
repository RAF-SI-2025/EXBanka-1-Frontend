import { apiClient } from '@/lib/api/axios'
import {
  exerciseOtcOptionContract,
  getMyOtcOptionContracts,
  getOtcOptionContract,
} from '@/lib/api/otcOption'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)

beforeEach(() => jest.clearAllMocks())

describe('getOtcOptionContract', () => {
  it('GET /otc/contracts/:id', async () => {
    mockGet.mockResolvedValue({ data: { contract: createMockOptionContract() } })
    await getOtcOptionContract(5001)
    expect(mockGet).toHaveBeenCalledWith('/otc/contracts/5001')
  })

  it('normalises flat buyer/seller fields into nested OtcParty objects', async () => {
    mockGet.mockResolvedValue({
      data: {
        contract: {
          id: 5001,
          status: 'ACTIVE',
          ticker: 'AAPL',
          quantity: '100',
          strike_price: '5000.00',
          premium_paid: '50000.00',
          settlement_date: '2026-06-05',
          buyer_owner_type: 'client',
          buyer_owner_id: 7,
          seller_owner_type: 'client',
          seller_owner_id: 42,
        },
      },
    })
    const { contract } = await getOtcOptionContract(5001)
    expect(contract.buyer).toEqual({ owner_type: 'client', owner_id: 7 })
    expect(contract.seller).toEqual({ owner_type: 'client', owner_id: 42 })
  })

  it('passes through already-nested buyer/seller', async () => {
    const nested = createMockOptionContract({
      buyer: { owner_type: 'bank', owner_id: null },
      seller: { owner_type: 'client', owner_id: 99 },
    })
    mockGet.mockResolvedValue({ data: { contract: nested } })
    const { contract } = await getOtcOptionContract(5001)
    expect(contract.buyer).toEqual({ owner_type: 'bank', owner_id: null })
    expect(contract.seller).toEqual({ owner_type: 'client', owner_id: 99 })
  })

  it('maps wire ticker into contract.ticker', async () => {
    mockGet.mockResolvedValue({
      data: {
        contract: {
          id: 17,
          status: 'ACTIVE',
          ticker: 'AAPL',
          quantity: '10',
          strike_price: '175.50',
          premium_paid: '700.00',
          settlement_date: '2027-08-01T00:00:00Z',
          buyer_owner_type: 'client',
          buyer_owner_id: 7,
          seller_owner_type: 'client',
          seller_owner_id: 42,
        },
      },
    })
    const { contract } = await getOtcOptionContract(17)
    expect(contract.ticker).toBe('AAPL')
  })

  it('maps wire premium_paid into contract.premium', async () => {
    mockGet.mockResolvedValue({
      data: {
        contract: {
          id: 17,
          status: 'ACTIVE',
          ticker: 'AAPL',
          quantity: '10',
          strike_price: '175.50',
          premium_paid: '700.00',
          settlement_date: '2027-08-01T00:00:00Z',
          buyer_owner_type: 'client',
          buyer_owner_id: 7,
          seller_owner_type: 'client',
          seller_owner_id: 42,
        },
      },
    })
    const { contract } = await getOtcOptionContract(17)
    expect(contract.premium).toBe('700.00')
  })

  it('falls back to premium when premium_paid absent', async () => {
    const nested = createMockOptionContract({ premium: '500.00' })
    mockGet.mockResolvedValue({ data: { contract: nested } })
    const { contract } = await getOtcOptionContract(5001)
    expect(contract.premium).toBe('500.00')
  })

  it('defaults kind to "local" when the wire omits it', async () => {
    mockGet.mockResolvedValue({ data: { contract: createMockOptionContract() } })
    const { contract } = await getOtcOptionContract(5001)
    expect(contract.kind).toBe('local')
  })

  it('maps wire kind="remote" and strike_currency for cross-bank contracts', async () => {
    mockGet.mockResolvedValue({
      data: {
        contract: {
          id: 1,
          status: 'active',
          kind: 'remote',
          ticker: 'ACME',
          quantity: '10',
          strike_price: '175.50',
          strike_currency: 'USD',
          premium_paid: '700.00',
          settlement_date: '2027-08-01T00:00:00Z',
          buyer_owner_type: 'client',
          buyer_owner_id: 7,
          seller_owner_type: 'client',
          seller_owner_id: 42,
        },
      },
    })
    const { contract } = await getOtcOptionContract(1)
    expect(contract.kind).toBe('remote')
    expect(contract.strike_currency).toBe('USD')
  })

  it('maps wire stock_ticker into ticker when ticker is absent (remote projection)', async () => {
    // Remote (cross-bank) contract rows project the symbol as `stock_ticker`,
    // not `ticker` (REST_API_v3 §30).
    mockGet.mockResolvedValue({
      data: {
        contract: {
          id: 1,
          status: 'active',
          kind: 'remote',
          stock_ticker: 'ACME',
          quantity: '10',
          strike_price: '175.50',
          strike_currency: 'USD',
          premium_paid: '700.00',
          settlement_date: '2027-08-01T00:00:00Z',
          buyer_owner_type: 'client',
          buyer_owner_id: 7,
          seller_owner_type: 'client',
          seller_owner_id: 42,
        },
      },
    })
    const { contract } = await getOtcOptionContract(1)
    expect(contract.ticker).toBe('ACME')
  })

  it('upper-cases a lowercase remote (peer-vocabulary) status', async () => {
    // Cross-bank peer contracts project `status` in the peer's lowercase
    // vocabulary (REST_API_v3 §30); normalise so downstream uppercase checks
    // (active/concluded grouping, exercise gating, badge colour) work.
    mockGet.mockResolvedValue({
      data: {
        contract: {
          id: 17,
          status: 'active',
          ticker: 'ACME',
          quantity: '10',
          strike_price: '175.50',
          premium_paid: '700.00',
          settlement_date: '2027-08-01T00:00:00Z',
          buyer_owner_type: 'client',
          buyer_owner_id: 7,
          seller_owner_type: 'client',
          seller_owner_id: 42,
        },
      },
    })
    const { contract } = await getOtcOptionContract(17)
    expect(contract.status).toBe('ACTIVE')
  })
})

describe('getMyOtcOptionContracts', () => {
  it('GET /me/otc/contracts with role filter', async () => {
    mockGet.mockResolvedValue({ data: { contracts: [createMockOptionContract()], total: 1 } })
    await getMyOtcOptionContracts({ role: 'buyer' })
    expect(mockGet).toHaveBeenCalledWith('/me/otc/contracts', { params: { role: 'buyer' } })
  })

  it('defaults contracts[] to [] when the response omits it', async () => {
    mockGet.mockResolvedValue({ data: {} })
    const result = await getMyOtcOptionContracts()
    expect(result.contracts).toEqual([])
  })

  it("normalises every row's buyer/seller", async () => {
    mockGet.mockResolvedValue({
      data: {
        contracts: [
          {
            id: 5001,
            status: 'ACTIVE',
            ticker: 'AAPL',
            quantity: '100',
            strike_price: '5000.00',
            premium_paid: '50000.00',
            settlement_date: '2026-06-05',
            buyer_owner_type: 'client',
            buyer_owner_id: '7',
            seller_owner_type: 'bank',
            seller_owner_id: null,
          },
          {
            id: 5002,
            status: 'EXERCISED',
            ticker: 'GOOG',
            quantity: '10',
            strike_price: '100.00',
            premium_paid: '1000.00',
            settlement_date: '2026-07-05',
            buyer_owner_type: 'employee',
            buyer_owner_id: 3,
            seller_owner_type: 'client',
            seller_owner_id: 12,
          },
        ],
        total: 2,
      },
    })
    const { contracts } = await getMyOtcOptionContracts()
    expect(contracts[0].buyer).toEqual({ owner_type: 'client', owner_id: 7 })
    expect(contracts[0].seller).toEqual({ owner_type: 'bank', owner_id: null })
    expect(contracts[1].buyer).toEqual({ owner_type: 'employee', owner_id: 3 })
    expect(contracts[1].seller).toEqual({ owner_type: 'client', owner_id: 12 })
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

  it('forwards buyer_account_number and on_behalf_of_fund_id when provided', async () => {
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
    await exerciseOtcOptionContract(5001, {
      buyer_account_number: '111000123456789011',
      on_behalf_of_fund_id: 101,
    })
    expect(mockPost).toHaveBeenCalledWith('/otc/contracts/5001/exercise', {
      buyer_account_number: '111000123456789011',
      on_behalf_of_fund_id: 101,
    })
  })

  it("normalises the returned contract's buyer/seller", async () => {
    mockPost.mockResolvedValue({
      data: {
        contract: {
          id: 5001,
          status: 'EXERCISED',
          ticker: 'AAPL',
          quantity: '100',
          strike_price: '5000.00',
          premium_paid: '50000.00',
          settlement_date: '2026-06-05',
          buyer_owner_type: 'client',
          buyer_owner_id: 7,
          seller_owner_type: 'client',
          seller_owner_id: 42,
        },
        holding: {
          id: 9001,
          stock_id: 42,
          quantity: '100',
          owner: { owner_type: 'client', owner_id: 7 },
        },
      },
    })
    const result = await exerciseOtcOptionContract(5001, {})
    expect(result.contract.buyer).toEqual({ owner_type: 'client', owner_id: 7 })
    expect(result.contract.seller).toEqual({ owner_type: 'client', owner_id: 42 })
  })
})
