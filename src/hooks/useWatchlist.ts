import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '@/lib/api/watchlist'
import type { WatchlistFilters } from '@/types/watchlist'

const KEY = ['watchlist'] as const

export function useWatchlist(filters: WatchlistFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => getWatchlist(filters),
  })
}

export function useAddToWatchlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (listing_id: number) => addToWatchlist(listing_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (listing_id: number) => removeFromWatchlist(listing_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}
