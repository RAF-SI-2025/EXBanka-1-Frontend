import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useFunds,
  useFund,
  useMyFundPositions,
  useCreateFund,
  useUpdateFund,
  useInvestFund,
  useRedeemFund,
} from '@/hooks/useFunds'
import * as fundsApi from '@/lib/api/funds'
import {
  createMockFund,
  createMockFundContribution,
  createMockClientFundPosition,
} from '@/__tests__/fixtures/fund-fixtures'

jest.mock('@/lib/api/funds')

beforeEach(() => jest.clearAllMocks())

describe('useFunds', () => {
  it('fetches funds with filters', async () => {
    jest.mocked(fundsApi.getFunds).mockResolvedValue({ funds: [createMockFund()], total: 1 })
    const { result } = renderHook(() => useFunds({ search: 'Alpha' }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fundsApi.getFunds).toHaveBeenCalledWith({ search: 'Alpha' })
  })
})

describe('useFund', () => {
  it('fetches a single fund', async () => {
    jest.mocked(fundsApi.getFund).mockResolvedValue({
      fund: createMockFund({ id: 5 }),
      holdings: [],
      performance: [],
    })
    const { result } = renderHook(() => useFund(5), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fundsApi.getFund).toHaveBeenCalledWith(5)
  })

  it('does not fetch when id is null', () => {
    renderHook(() => useFund(null), { wrapper: createQueryWrapper() })
    expect(fundsApi.getFund).not.toHaveBeenCalled()
  })
})

describe('useMyFundPositions', () => {
  it('fetches positions', async () => {
    jest
      .mocked(fundsApi.getMyFundPositions)
      .mockResolvedValue({ positions: [createMockClientFundPosition()] })
    const { result } = renderHook(() => useMyFundPositions(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.positions).toHaveLength(1)
  })
})

describe('useCreateFund', () => {
  it('calls createFund', async () => {
    jest.mocked(fundsApi.createFund).mockResolvedValue({ fund: createMockFund() })
    const { result } = renderHook(() => useCreateFund(), { wrapper: createQueryWrapper() })
    await act(async () => {
      await result.current.mutateAsync({ name: 'Alpha' })
    })
    expect(fundsApi.createFund).toHaveBeenCalledWith({ name: 'Alpha' })
  })
})

describe('useUpdateFund', () => {
  it('calls updateFund', async () => {
    jest.mocked(fundsApi.updateFund).mockResolvedValue({ fund: createMockFund() })
    const { result } = renderHook(() => useUpdateFund(101), { wrapper: createQueryWrapper() })
    await act(async () => {
      await result.current.mutateAsync({ active: false })
    })
    expect(fundsApi.updateFund).toHaveBeenCalledWith(101, { active: false })
  })
})

describe('useInvestFund', () => {
  it('calls investInFund', async () => {
    jest
      .mocked(fundsApi.investInFund)
      .mockResolvedValue({ contribution: createMockFundContribution() })
    const { result } = renderHook(() => useInvestFund(101), { wrapper: createQueryWrapper() })
    await act(async () => {
      await result.current.mutateAsync({
        source_account_id: 5,
        amount: '10000.00',
        currency: 'RSD',
      })
    })
    expect(fundsApi.investInFund).toHaveBeenCalledWith(101, {
      source_account_id: 5,
      amount: '10000.00',
      currency: 'RSD',
    })
  })
})

describe('useRedeemFund', () => {
  it('calls redeemFromFund', async () => {
    jest
      .mocked(fundsApi.redeemFromFund)
      .mockResolvedValue({ contribution: createMockFundContribution() })
    const { result } = renderHook(() => useRedeemFund(101), { wrapper: createQueryWrapper() })
    await act(async () => {
      await result.current.mutateAsync({ amount_rsd: '5000.00', target_account_id: 5 })
    })
    expect(fundsApi.redeemFromFund).toHaveBeenCalledWith(101, {
      amount_rsd: '5000.00',
      target_account_id: 5,
    })
  })
})
