import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  usePortfolio,
  usePortfolioSummary,
  useMakePublic,
  useExerciseOption,
} from '@/hooks/usePortfolio'
import * as portfolioApi from '@/lib/api/portfolio'
import {
  createMockHolding,
  createMockPortfolioSummary,
} from '@/__tests__/fixtures/portfolio-fixtures'

jest.mock('@/lib/api/portfolio')

beforeEach(() => jest.clearAllMocks())

describe('usePortfolio', () => {
  it('fetches holdings with no filters by default', async () => {
    const response = { holdings: [createMockHolding()], total_count: 1 }
    jest.mocked(portfolioApi.getPortfolio).mockResolvedValue(response)

    const { result } = renderHook(() => usePortfolio(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(portfolioApi.getPortfolio).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { holdings: [createMockHolding()], total_count: 1 }
    jest.mocked(portfolioApi.getPortfolio).mockResolvedValue(response)

    const filters = { security_type: 'stock' as const, page: 1, page_size: 10 }
    const { result } = renderHook(() => usePortfolio(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(portfolioApi.getPortfolio).toHaveBeenCalledWith(filters)
  })
})

describe('usePortfolioSummary', () => {
  it('fetches portfolio summary', async () => {
    const summary = createMockPortfolioSummary()
    jest.mocked(portfolioApi.getPortfolioSummary).mockResolvedValue(summary)

    const { result } = renderHook(() => usePortfolioSummary(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(summary)
  })
})

describe('useMakePublic', () => {
  it('calls makeHoldingPublic', async () => {
    const holding = createMockHolding({ is_public: true, public_quantity: 5 })
    jest.mocked(portfolioApi.makeHoldingPublic).mockResolvedValue(holding)

    const { result } = renderHook(() => useMakePublic(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 1, payload: { quantity: 5 } })
    })

    expect(portfolioApi.makeHoldingPublic).toHaveBeenCalledWith(1, { quantity: 5 })
  })
})

describe('useExerciseOption', () => {
  it('calls exerciseOption', async () => {
    const holding = createMockHolding({ security_type: 'option' })
    jest.mocked(portfolioApi.exerciseOption).mockResolvedValue(holding)

    const { result } = renderHook(() => useExerciseOption(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(portfolioApi.exerciseOption).toHaveBeenCalledWith(1)
  })
})
