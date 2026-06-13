import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useOtcOptionContract,
  useMyOtcOptionContracts,
  useExerciseOtcOptionContract,
} from '@/hooks/useOtcOptions'
import * as otcOptionApi from '@/lib/api/otcOption'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'

jest.mock('@/lib/api/otcOption')

beforeEach(() => jest.clearAllMocks())

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
