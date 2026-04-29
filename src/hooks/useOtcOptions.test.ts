import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useOtcOptionOffer,
  useMyOtcOptionOffers,
  useCreateOtcOptionOffer,
  useCounterOtcOptionOffer,
  useAcceptOtcOptionOffer,
  useRejectOtcOptionOffer,
  useOtcOptionContract,
  useMyOtcOptionContracts,
  useExerciseOtcOptionContract,
} from '@/hooks/useOtcOptions'
import * as otcOptionApi from '@/lib/api/otcOption'
import {
  createMockOtcOptionOffer,
  createMockOptionContract,
} from '@/__tests__/fixtures/otcOption-fixtures'

jest.mock('@/lib/api/otcOption')

beforeEach(() => jest.clearAllMocks())

describe('useOtcOptionOffer', () => {
  it('fetches offer detail when id is positive', async () => {
    jest.mocked(otcOptionApi.getOtcOptionOffer).mockResolvedValue({
      offer: createMockOtcOptionOffer(),
      revisions: [],
    })
    const { result } = renderHook(() => useOtcOptionOffer(1001), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getOtcOptionOffer).toHaveBeenCalledWith(1001)
  })

  it('does not fetch when id is null', () => {
    renderHook(() => useOtcOptionOffer(null), { wrapper: createQueryWrapper() })
    expect(otcOptionApi.getOtcOptionOffer).not.toHaveBeenCalled()
  })
})

describe('useMyOtcOptionOffers', () => {
  it('fetches with filters', async () => {
    jest.mocked(otcOptionApi.getMyOtcOptionOffers).mockResolvedValue({ offers: [], total: 0 })
    const { result } = renderHook(() => useMyOtcOptionOffers({ role: 'initiator' }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(otcOptionApi.getMyOtcOptionOffers).toHaveBeenCalledWith({ role: 'initiator' })
  })
})

describe('useCreateOtcOptionOffer', () => {
  it('calls createOtcOptionOffer', async () => {
    jest
      .mocked(otcOptionApi.createOtcOptionOffer)
      .mockResolvedValue({ offer: createMockOtcOptionOffer() })
    const { result } = renderHook(() => useCreateOtcOptionOffer(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({
        direction: 'sell_initiated',
        stock_id: 42,
        quantity: '100',
        strike_price: '5000.00',
        settlement_date: '2026-06-05',
      })
    })
    expect(otcOptionApi.createOtcOptionOffer).toHaveBeenCalled()
  })
})

describe('useCounterOtcOptionOffer', () => {
  it('calls counterOtcOptionOffer', async () => {
    jest
      .mocked(otcOptionApi.counterOtcOptionOffer)
      .mockResolvedValue({ offer: createMockOtcOptionOffer() })
    const { result } = renderHook(() => useCounterOtcOptionOffer(1001), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({ premium: '52000' })
    })
    expect(otcOptionApi.counterOtcOptionOffer).toHaveBeenCalledWith(1001, {
      premium: '52000',
    })
  })
})

describe('useAcceptOtcOptionOffer', () => {
  it('calls acceptOtcOptionOffer', async () => {
    jest.mocked(otcOptionApi.acceptOtcOptionOffer).mockResolvedValue({
      offer: createMockOtcOptionOffer(),
      contract: createMockOptionContract(),
    })
    const { result } = renderHook(() => useAcceptOtcOptionOffer(1001), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({ buyer_account_id: 5, seller_account_id: 9 })
    })
    expect(otcOptionApi.acceptOtcOptionOffer).toHaveBeenCalledWith(1001, {
      buyer_account_id: 5,
      seller_account_id: 9,
    })
  })
})

describe('useRejectOtcOptionOffer', () => {
  it('calls rejectOtcOptionOffer', async () => {
    jest
      .mocked(otcOptionApi.rejectOtcOptionOffer)
      .mockResolvedValue({ offer: createMockOtcOptionOffer({ status: 'REJECTED' }) })
    const { result } = renderHook(() => useRejectOtcOptionOffer(1001), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync()
    })
    expect(otcOptionApi.rejectOtcOptionOffer).toHaveBeenCalledWith(1001)
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
  it('calls exerciseOtcOptionContract', async () => {
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
      await result.current.mutateAsync({ buyer_account_id: 5, seller_account_id: 9 })
    })
    expect(otcOptionApi.exerciseOtcOptionContract).toHaveBeenCalledWith(5001, {
      buyer_account_id: 5,
      seller_account_id: 9,
    })
  })
})
