import { renderHook, act, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useOtcOffers,
  useBuyOtcOffer,
  useBuyOtcOfferOnBehalf,
  usePlaceBidOnRemoteOffer,
} from '@/hooks/useOtc'
import * as otcApi from '@/lib/api/otc'
import * as otcOptionsApiModule from '@/views/otcOptions/api/otcOptionsApi'
import { createMockOtcOfferListResponse } from '@/__tests__/fixtures/otc-fixtures'

jest.mock('@/lib/api/otc')
jest.mock('@/views/otcOptions/api/otcOptionsApi', () => ({
  otcOptionsApi: { placeBid: jest.fn() },
}))

const mockGetOtcOffers = jest.mocked(otcApi.getOtcOffers)
const mockBuyOtcOffer = jest.mocked(otcApi.buyOtcOffer)
const mockBuyOtcOfferOnBehalf = jest.mocked(otcApi.buyOtcOfferOnBehalf)
const mockPlaceBid = jest.mocked(otcOptionsApiModule.otcOptionsApi.placeBid)

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

describe('usePlaceBidOnRemoteOffer', () => {
  it('calls otcOptionsApi.placeBid with the offerId and bid payload', async () => {
    mockPlaceBid.mockResolvedValue({ negotiation: {} as any })
    const { result } = renderHook(() => usePlaceBidOnRemoteOffer(), {
      wrapper: createQueryWrapper(),
    })
    const input = {
      offerId: 42,
      bidder_account_id: 13,
      quantity: '2',
      strike_price: '175.00',
      premium: '40.00',
      settlement_date: '2027-08-01',
    }
    await act(async () => {
      result.current.mutate(input)
    })
    await waitFor(() =>
      expect(mockPlaceBid).toHaveBeenCalledWith(42, {
        bidder_account_id: 13,
        quantity: '2',
        strike_price: '175.00',
        premium: '40.00',
        settlement_date: '2027-08-01',
      })
    )
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
