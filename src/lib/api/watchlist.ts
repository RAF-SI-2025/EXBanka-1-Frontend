import { apiClient } from '@/lib/api/axios'
import type { WatchlistFilters, WatchlistItem, WatchlistResponse } from '@/types/watchlist'

export async function getWatchlist(filters: WatchlistFilters = {}): Promise<WatchlistResponse> {
  const { data } = await apiClient.get<WatchlistResponse>('/me/watchlist', { params: filters })
  return { items: data.items ?? [] }
}

export async function addToWatchlist(listing_id: number): Promise<WatchlistItem> {
  const { data } = await apiClient.post<{ item: WatchlistItem }>('/me/watchlist', { listing_id })
  return data.item
}

export async function removeFromWatchlist(listing_id: number): Promise<void> {
  await apiClient.delete(`/me/watchlist/${listing_id}`)
}
