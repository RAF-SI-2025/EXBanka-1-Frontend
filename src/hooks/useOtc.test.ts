import { renderHook, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useOtcOffers, useBuyOtcOffer, useBuyOtcOfferOnBehalf } from '@/hooks/useOtc'
import * as otcApi from '@/lib/api/otc'

jest.mock('@/lib/api/otc')

const mockGetOtcOffers = jest.mocked(otcApi.getOtcOffers)
const mockBuyOtcOffer = jest.mocked(otcApi.buyOtcOffer)
const mockBuyOtcOfferOnBehalf = jest.mocked(otcApi.buyOtcOfferOnBehalf)

beforeEach(() => jest.clearAllMocks())

describe('useOtcOffers', () => {
  it('calls getOtcOffers with provided filters', async () => {
    mockGetOtcOffers.mockResolvedValue({ offers: [], total_count: 0 })
    const filters = { ticker: 'AAPL' }
    renderHook(() => useOtcOffers(filters), { wrapper: createQueryWrapper() })
    await act(async () => {})
    expect(mockGetOtcOffers).toHaveBeenCalledWith(filters)
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
