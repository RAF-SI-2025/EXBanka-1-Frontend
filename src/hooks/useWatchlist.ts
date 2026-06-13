import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addToWatchlistItems,
  createWatchlist,
  deleteWatchlist,
  getWatchlistItems,
  getWatchlists,
  removeFromWatchlistItems,
} from '@/lib/api/watchlist'
import type { WatchlistFilters } from '@/types/watchlist'

const LISTS_KEY = ['watchlists'] as const
const ITEMS_KEY = ['watchlist-items'] as const

const itemsKey = (watchlistId: number, filters: WatchlistFilters = {}) =>
  [...ITEMS_KEY, watchlistId, filters] as const

export function useWatchlists() {
  return useQuery({
    queryKey: LISTS_KEY,
    queryFn: getWatchlists,
  })
}

export function useWatchlistItems(watchlistId: number | undefined, filters: WatchlistFilters = {}) {
  return useQuery({
    queryKey: itemsKey(watchlistId ?? 0, filters),
    queryFn: () => getWatchlistItems(watchlistId as number, filters),
    enabled: watchlistId != null,
  })
}

export function useCreateWatchlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createWatchlist(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTS_KEY })
    },
  })
}

export function useDeleteWatchlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (watchlistId: number) => deleteWatchlist(watchlistId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTS_KEY })
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}

export function useAddToWatchlistItems() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ watchlistId, listingId }: { watchlistId: number; listingId: number }) =>
      addToWatchlistItems(watchlistId, listingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTS_KEY })
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}

export function useRemoveFromWatchlistItems() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ watchlistId, listingId }: { watchlistId: number; listingId: number }) =>
      removeFromWatchlistItems(watchlistId, listingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTS_KEY })
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}

/**
 * Set of listing ids that live in *any* of the caller's watchlists.
 * Drives the filled-heart state on the securities tables. Fetches each list's
 * items in parallel and unions their listing ids.
 */
export function useWatchlistMembership(): Set<number> {
  const { data: watchlists } = useWatchlists()
  return useQueries({
    queries: (watchlists ?? []).map((wl) => ({
      queryKey: itemsKey(wl.id),
      queryFn: () => getWatchlistItems(wl.id),
    })),
    combine: (results) => {
      const ids = new Set<number>()
      for (const result of results) {
        for (const item of result.data?.items ?? []) ids.add(item.listing_id)
      }
      return ids
    },
  })
}
