import {
  DEFAULT_WATCHLIST_NAME,
  FAVORITES_LABEL,
  displayWatchlistName,
  isDefaultWatchlist,
} from '@/lib/utils/watchlist'
import type { Watchlist } from '@/types/watchlist'

const makeWatchlist = (overrides: Partial<Watchlist> = {}): Watchlist => ({
  id: 1,
  name: 'tech',
  item_count: 0,
  created_at: 1731699200,
  ...overrides,
})

describe('displayWatchlistName', () => {
  it('relabels the backend default ("My Watchlist") as "Favorites"', () => {
    expect(displayWatchlistName(DEFAULT_WATCHLIST_NAME)).toBe(FAVORITES_LABEL)
  })

  it('leaves any other list name untouched', () => {
    expect(displayWatchlistName('tech')).toBe('tech')
    expect(displayWatchlistName('forex pairs')).toBe('forex pairs')
  })
})

describe('isDefaultWatchlist', () => {
  it('is true only for the backend default name', () => {
    expect(isDefaultWatchlist(makeWatchlist({ name: DEFAULT_WATCHLIST_NAME }))).toBe(true)
    expect(isDefaultWatchlist(makeWatchlist({ name: 'tech' }))).toBe(false)
  })
})
