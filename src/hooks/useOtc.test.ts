import { renderHook, act, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useOtcOffers,
  useBuyOtcOffer,
  useBuyOtcOfferOnBehalf,
  useCreatePeerOtcNegotiation,
} from '@/hooks/useOtc'
import * as otcApi from '@/lib/api/otc'
import { createMockOtcOfferListResponse } from '@/__tests__/fixtures/otc-fixtures'

jest.mock('@/lib/api/otc')

const mockGetOtcOffers = jest.mocked(otcApi.getOtcOffers)
const mockBuyOtcOffer = jest.mocked(otcApi.buyOtcOffer)
const mockBuyOtcOfferOnBehalf = jest.mocked(otcApi.buyOtcOfferOnBehalf)
const mockCreatePeerOtcNegotiation = jest.mocked(otcApi.createPeerOtcNegotiation)

beforeEach(() => jest.clearAllMocks())

describe('useOtcOffers', () => {
  it('calls getOtcOffers with provided filters', async () => {
    mockGetOtcOffers.mockResolvedValue(createMockOtcOfferListResponse({ offers: [] }))
    const filters = { ticker: 'AAPL' }
    renderHook(() => useOtcOffers(filters), { wrapper: createQueryWrapper() })
    await act(async () => {})
    expect(mockGetOtcOffers).toHaveBeenCalledWith(filters)
  })
})

describe('useCreatePeerOtcNegotiation', () => {
  it('forwards the negotiation payload to the api', async () => {
    mockCreatePeerOtcNegotiation.mockResolvedValue({ routingNumber: 333, id: 'abc' })
    const { result } = renderHook(() => useCreatePeerOtcNegotiation(), {
      wrapper: createQueryWrapper(),
    })
    const payload = {
      seller_bank_code: '333',
      seller_id: '0',
      stock: { ticker: 'MSFT' },
      amount: 2,
      settlement_date: '2027-08-01T00:00:00.000Z',
      price_per_unit: { amount: '420.50', currency: 'USD' },
      premium: { amount: '40', currency: 'USD' },
    }
    await act(async () => {
      result.current.mutate(payload)
    })
    await waitFor(() => expect(mockCreatePeerOtcNegotiation).toHaveBeenCalledWith(payload))
  })
})

describe('useBuyOtcOffer', () => {
  it('calls buyOtcOffer with id and payload on mutate', async () => {
    mockBuyOtcOffer.mockResolvedValue(undefined)
    const { result } = renderHook(() => useBuyOtcOffer(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.mutate({ id: 3, quantity: 2, account_id: 42 })
    })
    expect(mockBuyOtcOffer).toHaveBeenCalledWith(3, { quantity: 2, account_id: 42 })
  })
})

describe('useBuyOtcOfferOnBehalf', () => {
  it('calls buyOtcOfferOnBehalf with id and payload on mutate', async () => {
    mockBuyOtcOfferOnBehalf.mockResolvedValue(undefined)
    const { result } = renderHook(() => useBuyOtcOfferOnBehalf(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({
        id: 7,
        client_id: 5,
        account_id: 12,
        quantity: 3,
      })
    })
    expect(mockBuyOtcOfferOnBehalf).toHaveBeenCalledWith(7, {
      client_id: 5,
      account_id: 12,
      quantity: 3,
    })
  })
})
