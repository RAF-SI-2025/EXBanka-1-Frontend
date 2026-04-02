import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { usePortfolio, useMakePublic, useExerciseOption } from '@/hooks/usePortfolio'
import * as portfolioApi from '@/lib/api/portfolio'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'

jest.mock('@/lib/api/portfolio')

const mockMakePublicHolding = jest.mocked(portfolioApi.makePublicHolding)
const mockExerciseOption = jest.mocked(portfolioApi.exerciseOption)

beforeEach(() => jest.clearAllMocks())

describe('usePortfolio', () => {
  it('fetches portfolio holdings', async () => {
    const holdings = [createMockHolding({ id: 1 }), createMockHolding({ id: 2, ticker: 'MSFT' })]
    jest.mocked(portfolioApi.getPortfolio).mockResolvedValue({ holdings, total_count: 2 })

    const { result } = renderHook(() => usePortfolio(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.holdings).toHaveLength(2)
    expect(portfolioApi.getPortfolio).toHaveBeenCalledWith(undefined, undefined)
  })
})

describe('useMakePublic', () => {
  it('calls makePublicHolding with id and quantity on mutate', async () => {
    mockMakePublicHolding.mockResolvedValue(undefined)
    const { result } = renderHook(() => useMakePublic(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.mutate({ id: 1, quantity: 3 })
    })
    expect(mockMakePublicHolding).toHaveBeenCalledWith(1, 3)
  })
})

describe('useExerciseOption', () => {
  it('calls exerciseOption with id on mutate', async () => {
    mockExerciseOption.mockResolvedValue(undefined)
    const { result } = renderHook(() => useExerciseOption(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.mutate(5)
    })
    expect(mockExerciseOption).toHaveBeenCalledWith(5)
  })
})
