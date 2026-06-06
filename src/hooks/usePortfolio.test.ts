import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  usePortfolio,
  usePortfolioSummary,
  useMakePublic,
  useExerciseOption,
  useHoldingTransactions,
} from '@/hooks/usePortfolio'
import * as portfolioApi from '@/lib/api/portfolio'
import {
  createMockPortfolioResponse,
  createMockSecurityPosition,
  createMockPortfolioSummary,
  createMockHoldingTransaction,
} from '@/__tests__/fixtures/portfolio-fixtures'

jest.mock('@/lib/api/portfolio')

beforeEach(() => jest.clearAllMocks())

describe('usePortfolio', () => {
  it('fetches the unified portfolio (no parameters)', async () => {
    const response = createMockPortfolioResponse()
    jest.mocked(portfolioApi.getPortfolio).mockResolvedValue(response)

    const { result } = renderHook(() => usePortfolio(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(portfolioApi.getPortfolio).toHaveBeenCalledWith()
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
  it('calls makeHoldingPublic with the holding_id', async () => {
    jest
      .mocked(portfolioApi.makeHoldingPublic)
      .mockResolvedValue({ offer: { id: 1, public_quantity: 5 } })

    const { result } = renderHook(() => useMakePublic(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 153, payload: { quantity: 5 } })
    })

    expect(portfolioApi.makeHoldingPublic).toHaveBeenCalledWith(153, { quantity: 5 })
  })
})

describe('useExerciseOption', () => {
  it('calls exerciseOption with the holding_id', async () => {
    const position = createMockSecurityPosition({ asset_type: 'option', holding_id: 32 })
    jest.mocked(portfolioApi.exerciseOption).mockResolvedValue(position)

    const { result } = renderHook(() => useExerciseOption(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(32)
    })

    expect(portfolioApi.exerciseOption).toHaveBeenCalledWith(32)
  })
})

describe('useHoldingTransactions', () => {
  it('fetches transactions for a holding', async () => {
    const txn = createMockHoldingTransaction()
    const response = { transactions: [txn], total_count: 1 }
    jest.mocked(portfolioApi.getHoldingTransactions).mockResolvedValue(response)

    const { result } = renderHook(() => useHoldingTransactions(5), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(portfolioApi.getHoldingTransactions).toHaveBeenCalledWith(5, {})
  })

  it('does not fetch when holdingId is 0', async () => {
    const { result } = renderHook(() => useHoldingTransactions(0), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(portfolioApi.getHoldingTransactions).not.toHaveBeenCalled()
  })
})
