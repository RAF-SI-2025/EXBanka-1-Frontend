import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useOtcOptionOffer,
  useMyOtcOptionOffers,
  useAllOtcOptionOffers,
  useCreateOtcOptionOffer,
  useOtcOptionNegotiations,
  useMyOtcOptionNegotiations,
  usePlaceBidOnOtcOption,
  useCounterOtcNegotiation,
  useAcceptOtcNegotiation,
  useRejectOtcNegotiation,
  useCancelOtcNegotiation,
  useOtcOptionContract,
  useMyOtcOptionContracts,
  useExerciseOtcOptionContract,
} from '@/hooks/useOtcOptions'
import * as otcOptionApi from '@/lib/api/otcOption'
import {
  createMockOtcOptionOffer,
  createMockOtcNegotiation,
  createMockOptionContract,
} from '@/__tests__/fixtures/otcOption-fixtures'

jest.mock('@/lib/api/otcOption')

beforeEach(() => jest.clearAllMocks())

describe('useOtcOptionOffer', () => {
  it('fetches offer detail when id is positive', async () => {
    jest.mocked(otcOptionApi.getOtcOptionOffer).mockResolvedValue({
      offer: createMockOtcOptionOffer(),
    })
    const { result } = renderHook(() => useOtcOptionOffer(1001), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getOtcOptionOffer).toHaveBeenCalledWith(1001)
  })

  it('is disabled when id is null', () => {
    const { result } = renderHook(() => useOtcOptionOffer(null), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useMyOtcOptionOffers', () => {
  it('fetches with filters', async () => {
    jest
      .mocked(otcOptionApi.getMyOtcOptionOffers)
      .mockResolvedValue({ offers: [createMockOtcOptionOffer()], total: 1 })
    const { result } = renderHook(() => useMyOtcOptionOffers({ role: 'initiator' }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getMyOtcOptionOffers).toHaveBeenCalledWith({ role: 'initiator' })
  })
})

describe('useAllOtcOptionOffers', () => {
  it('fetches all listings', async () => {
    jest.mocked(otcOptionApi.getAllOtcOptionOffers).mockResolvedValue({ offers: [], total: 0 })
    const { result } = renderHook(() => useAllOtcOptionOffers(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getAllOtcOptionOffers).toHaveBeenCalledWith({})
  })
})

describe('useCreateOtcOptionOffer', () => {
  it('posts the payload via createOtcOptionOffer', async () => {
    jest
      .mocked(otcOptionApi.createOtcOptionOffer)
      .mockResolvedValue({ offer: createMockOtcOptionOffer() })
    const { result } = renderHook(() => useCreateOtcOptionOffer(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({
        direction: 'sell_initiated',
        ticker: 'AAPL',
        quantity: '100',
        strike_price: '5000.00',
        settlement_date: '2026-06-05',
        account_id: 4242,
      })
    })
    expect(otcOptionApi.createOtcOptionOffer).toHaveBeenCalled()
  })
})

describe('useOtcOptionNegotiations', () => {
  it("fetches a listing's negotiation chains", async () => {
    jest
      .mocked(otcOptionApi.getOtcOptionNegotiations)
      .mockResolvedValue({ negotiations: [createMockOtcNegotiation()], total: 1 })
    const { result } = renderHook(() => useOtcOptionNegotiations(1001), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getOtcOptionNegotiations).toHaveBeenCalledWith(1001)
  })
})

describe('useMyOtcOptionNegotiations', () => {
  it("fetches caller's chains with statuses filter", async () => {
    jest
      .mocked(otcOptionApi.getMyOtcOptionNegotiations)
      .mockResolvedValue({ negotiations: [], total: 0 })
    const { result } = renderHook(() => useMyOtcOptionNegotiations({ statuses: 'open' }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getMyOtcOptionNegotiations).toHaveBeenCalledWith({ statuses: 'open' })
  })
})

describe('usePlaceBidOnOtcOption', () => {
  it('posts a bid payload to the listing', async () => {
    jest
      .mocked(otcOptionApi.placeBidOnOtcOption)
      .mockResolvedValue({ negotiation: createMockOtcNegotiation() })
    const { result } = renderHook(() => usePlaceBidOnOtcOption(1001), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({
        bidder_account_id: 42,
        quantity: '100',
        strike_price: '5000.00',
        premium: '500.00',
        settlement_date: '2026-06-05',
      })
    })
    expect(otcOptionApi.placeBidOnOtcOption).toHaveBeenCalledWith(
      1001,
      expect.objectContaining({ bidder_account_id: 42 })
    )
  })
})

describe('useCounterOtcNegotiation', () => {
  it('posts a counter to the specified chain', async () => {
    jest
      .mocked(otcOptionApi.counterOtcNegotiation)
      .mockResolvedValue({ negotiation: createMockOtcNegotiation() })
    const { result } = renderHook(() => useCounterOtcNegotiation(1001, 5), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({ premium: '52000' })
    })
    expect(otcOptionApi.counterOtcNegotiation).toHaveBeenCalledWith(1001, 5, {
      premium: '52000',
    })
  })
})

describe('useAcceptOtcNegotiation', () => {
  it('posts acceptor_account_id to the chain', async () => {
    jest.mocked(otcOptionApi.acceptOtcNegotiation).mockResolvedValue({
      winning: createMockOtcNegotiation({ status: 'accepted' }),
      parent_offer_id: 1001,
      parent_status: 'consumed',
      cancelled_siblings: [],
      contract: createMockOptionContract(),
    })
    const { result } = renderHook(() => useAcceptOtcNegotiation(1001, 5), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({ acceptor_account_id: 42 })
    })
    expect(otcOptionApi.acceptOtcNegotiation).toHaveBeenCalledWith(1001, 5, {
      acceptor_account_id: 42,
    })
  })
})

describe('useRejectOtcNegotiation', () => {
  it('posts a reject (no body)', async () => {
    jest
      .mocked(otcOptionApi.rejectOtcNegotiation)
      .mockResolvedValue({ negotiation: createMockOtcNegotiation({ status: 'rejected' }) })
    const { result } = renderHook(() => useRejectOtcNegotiation(1001, 5), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync()
    })
    expect(otcOptionApi.rejectOtcNegotiation).toHaveBeenCalledWith(1001, 5)
  })
})

describe('useCancelOtcNegotiation', () => {
  it('DELETEs the chain', async () => {
    jest.mocked(otcOptionApi.cancelOtcNegotiation).mockResolvedValue(undefined)
    const { result } = renderHook(() => useCancelOtcNegotiation(1001, 5), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync()
    })
    expect(otcOptionApi.cancelOtcNegotiation).toHaveBeenCalledWith(1001, 5)
  })
})

describe('useOtcOptionContract', () => {
  it('fetches a contract', async () => {
    jest
      .mocked(otcOptionApi.getOtcOptionContract)
      .mockResolvedValue({ contract: createMockOptionContract() })
    const { result } = renderHook(() => useOtcOptionContract(5001), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getOtcOptionContract).toHaveBeenCalledWith(5001)
  })
})

describe('useMyOtcOptionContracts', () => {
  it('fetches contracts with filters', async () => {
    jest.mocked(otcOptionApi.getMyOtcOptionContracts).mockResolvedValue({ contracts: [], total: 0 })
    const { result } = renderHook(() => useMyOtcOptionContracts({ role: 'buyer' }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getMyOtcOptionContracts).toHaveBeenCalledWith({ role: 'buyer' })
  })
})

describe('useExerciseOtcOptionContract', () => {
  it('calls exerciseOtcOptionContract with empty body', async () => {
    jest.mocked(otcOptionApi.exerciseOtcOptionContract).mockResolvedValue({
      contract: createMockOptionContract({ status: 'EXERCISED' }),
      holding: {
        id: 9001,
        stock_id: 42,
        quantity: '100',
        owner: { owner_type: 'client', owner_id: 7 },
      },
    })
    const { result } = renderHook(() => useExerciseOtcOptionContract(5001), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({})
    })
    expect(otcOptionApi.exerciseOtcOptionContract).toHaveBeenCalledWith(5001, {})
  })
})
