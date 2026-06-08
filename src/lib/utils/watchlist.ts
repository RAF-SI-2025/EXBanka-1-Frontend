import type { Watchlist } from '@/types/watchlist'

/** The backend's lazily-created default list is named "My Watchlist". */
export const DEFAULT_WATCHLIST_NAME = 'My Watchlist'

/** What the default list is shown as in the UI. */
export const FAVORITES_LABEL = 'Favorites'

/** Map a raw backend list name to its display label (default list → "Favorites"). */
export function displayWatchlistName(name: string): string {
  return name === DEFAULT_WATCHLIST_NAME ? FAVORITES_LABEL : name
}

/** True when this list is the backend's default ("My Watchlist"). */
export function isDefaultWatchlist(watchlist: Watchlist): boolean {
  return watchlist.name === DEFAULT_WATCHLIST_NAME
}
