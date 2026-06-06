import { act, renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlist } from '@/hooks/useWatchlist'
import * as watchlistApi from '@/lib/api/watchlist'

jest.mock('@/lib/api/watchlist')

const sampleItem = {
  id: 1,
  listing_id: 42,
  security_type: 'stock' as const,
  ticker: 'AAPL',
  current_price: '187.45',
  daily_change: '1.25',
  daily_change_percent: '0.67',
  added_at_unix: 1731699200,
}

beforeEach(() => jest.clearAllMocks())

describe('useWatchlist', () => {
  it('fetches the watchlist with filters', async () => {
    jest.mocked(watchlistApi.getWatchlist).mockResolvedValue({ items: [sampleItem] })
    const { result } = renderHook(() => useWatchlist({ listing_type: 'stock' }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(watchlistApi.getWatchlist).toHaveBeenCalledWith({ listing_type: 'stock' })
  })
})

describe('useAddToWatchlist', () => {
  it('calls addToWatchlist with listing id', async () => {
    jest.mocked(watchlistApi.addToWatchlist).mockResolvedValue(sampleItem)
    const { result } = renderHook(() => useAddToWatchlist(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync(42)
    })
    expect(watchlistApi.addToWatchlist).toHaveBeenCalledWith(42)
  })
})

describe('useRemoveFromWatchlist', () => {
  it('calls removeFromWatchlist with listing id', async () => {
    jest.mocked(watchlistApi.removeFromWatchlist).mockResolvedValue(undefined)
    const { result } = renderHook(() => useRemoveFromWatchlist(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync(42)
    })
    expect(watchlistApi.removeFromWatchlist).toHaveBeenCalledWith(42)
  })
})
