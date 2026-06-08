import { act, renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useAddToWatchlistItems,
  useCreateWatchlist,
  useDeleteWatchlist,
  useRemoveFromWatchlistItems,
  useWatchlistItems,
  useWatchlistMembership,
  useWatchlists,
} from '@/hooks/useWatchlist'
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

const list = (id: number, name = 'tech') => ({ id, name, item_count: 1, created_at: 1731699200 })

beforeEach(() => jest.clearAllMocks())

describe('useWatchlists', () => {
  it('fetches the named watchlists', async () => {
    jest.mocked(watchlistApi.getWatchlists).mockResolvedValue([list(5)])
    const { result } = renderHook(() => useWatchlists(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([list(5)])
  })
})

describe('useWatchlistItems', () => {
  it('fetches a list’s items with filters', async () => {
    jest.mocked(watchlistApi.getWatchlistItems).mockResolvedValue({ items: [sampleItem] })
    const { result } = renderHook(() => useWatchlistItems(5, { listing_type: 'stock' }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(watchlistApi.getWatchlistItems).toHaveBeenCalledWith(5, { listing_type: 'stock' })
  })

  it('is disabled (does not fetch) when no list id is given', async () => {
    jest.mocked(watchlistApi.getWatchlistItems).mockResolvedValue({ items: [] })
    renderHook(() => useWatchlistItems(undefined), { wrapper: createQueryWrapper() })
    await Promise.resolve()
    expect(watchlistApi.getWatchlistItems).not.toHaveBeenCalled()
  })
})

describe('useCreateWatchlist', () => {
  it('calls createWatchlist with the name', async () => {
    jest.mocked(watchlistApi.createWatchlist).mockResolvedValue(list(7, 'forex'))
    const { result } = renderHook(() => useCreateWatchlist(), { wrapper: createQueryWrapper() })
    await act(async () => {
      await result.current.mutateAsync('forex')
    })
    expect(watchlistApi.createWatchlist).toHaveBeenCalledWith('forex')
  })
})

describe('useDeleteWatchlist', () => {
  it('calls deleteWatchlist with the id', async () => {
    jest.mocked(watchlistApi.deleteWatchlist).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteWatchlist(), { wrapper: createQueryWrapper() })
    await act(async () => {
      await result.current.mutateAsync(7)
    })
    expect(watchlistApi.deleteWatchlist).toHaveBeenCalledWith(7)
  })
})

describe('useAddToWatchlistItems', () => {
  it('calls addToWatchlistItems with list id + listing id', async () => {
    jest.mocked(watchlistApi.addToWatchlistItems).mockResolvedValue(sampleItem)
    const { result } = renderHook(() => useAddToWatchlistItems(), { wrapper: createQueryWrapper() })
    await act(async () => {
      await result.current.mutateAsync({ watchlistId: 5, listingId: 42 })
    })
    expect(watchlistApi.addToWatchlistItems).toHaveBeenCalledWith(5, 42)
  })
})

describe('useRemoveFromWatchlistItems', () => {
  it('calls removeFromWatchlistItems with list id + listing id', async () => {
    jest.mocked(watchlistApi.removeFromWatchlistItems).mockResolvedValue(undefined)
    const { result } = renderHook(() => useRemoveFromWatchlistItems(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.mutateAsync({ watchlistId: 5, listingId: 42 })
    })
    expect(watchlistApi.removeFromWatchlistItems).toHaveBeenCalledWith(5, 42)
  })
})

describe('useWatchlistMembership', () => {
  it('unions listing ids across every list into a single Set', async () => {
    jest.mocked(watchlistApi.getWatchlists).mockResolvedValue([list(5), list(6, 'forex')])
    jest
      .mocked(watchlistApi.getWatchlistItems)
      .mockImplementation(async (id: number) =>
        id === 5 ? { items: [sampleItem] } : { items: [{ ...sampleItem, id: 2, listing_id: 99 }] }
      )
    const { result } = renderHook(() => useWatchlistMembership(), { wrapper: createQueryWrapper() })
    await waitFor(() => {
      expect(result.current.has(42)).toBe(true)
      expect(result.current.has(99)).toBe(true)
    })
  })

  it('is an empty Set when there are no lists', async () => {
    jest.mocked(watchlistApi.getWatchlists).mockResolvedValue([])
    const { result } = renderHook(() => useWatchlistMembership(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.size).toBe(0))
    expect(watchlistApi.getWatchlistItems).not.toHaveBeenCalled()
  })
})
