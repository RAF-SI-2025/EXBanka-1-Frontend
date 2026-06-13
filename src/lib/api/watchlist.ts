import { apiClient } from '@/lib/api/axios'
import type {
  Watchlist,
  WatchlistFilters,
  WatchlistItem,
  WatchlistResponse,
  WatchlistsResponse,
} from '@/types/watchlist'

/** List the caller's named watchlists (always includes the default "My Watchlist"). */
export async function getWatchlists(): Promise<Watchlist[]> {
  const { data } = await apiClient.get<WatchlistsResponse | Watchlist[]>('/me/watchlists')
  if (Array.isArray(data)) return data
  return data.watchlists ?? []
}

/** Create a named watchlist. Idempotent on name. */
export async function createWatchlist(name: string): Promise<Watchlist> {
  const { data } = await apiClient.post<{ watchlist: Watchlist }>('/me/watchlists', { name })
  return data.watchlist
}

/** Delete a named watchlist and its items. */
export async function deleteWatchlist(watchlistId: number): Promise<void> {
  await apiClient.delete(`/me/watchlists/${watchlistId}`)
}

/** List a named list's items, enriched with live price + daily change. */
export async function getWatchlistItems(
  watchlistId: number,
  filters: WatchlistFilters = {}
): Promise<WatchlistResponse> {
  const { data } = await apiClient.get<WatchlistResponse>(`/me/watchlists/${watchlistId}/items`, {
    params: filters,
  })
  return { items: data.items ?? [] }
}

/** Add a listing to a named list. Idempotent. */
export async function addToWatchlistItems(
  watchlistId: number,
  listing_id: number
): Promise<WatchlistItem> {
  const { data } = await apiClient.post<{ item: WatchlistItem }>(
    `/me/watchlists/${watchlistId}/items`,
    { listing_id }
  )
  return data.item
}

/** Remove a listing from a named list. */
export async function removeFromWatchlistItems(
  watchlistId: number,
  listing_id: number
): Promise<void> {
  await apiClient.delete(`/me/watchlists/${watchlistId}/items/${listing_id}`)
}
