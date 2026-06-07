import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { WatchlistPanel } from '@/views/portfolio/components/WatchlistPanel'
import * as watchlistHooks from '@/hooks/useWatchlist'
import type { WatchlistItem } from '@/types/watchlist'

jest.mock('@/hooks/useWatchlist')
jest.mock('@/components/ui/select', () => jest.requireActual('@/__tests__/mocks/select-mock'))

const lists = [
  { id: 1, name: 'My Watchlist', item_count: 1, created_at: 1 },
  { id: 2, name: 'tech', item_count: 0, created_at: 2 },
]

const item: WatchlistItem = {
  id: 10,
  listing_id: 42,
  security_type: 'stock',
  ticker: 'AAPL',
  current_price: '187.45',
  daily_change: '1.25',
  daily_change_percent: '0.67',
  added_at_unix: 1731699200,
}

const createMutate = jest.fn()
const deleteMutate = jest.fn()
const removeMutate = jest.fn()

function mockHooks(opts: { items?: WatchlistItem[]; lists?: typeof lists } = {}) {
  jest.mocked(watchlistHooks.useWatchlists).mockReturnValue({ data: opts.lists ?? lists } as never)
  jest
    .mocked(watchlistHooks.useWatchlistItems)
    .mockReturnValue({ data: { items: opts.items ?? [item] } } as never)
  jest
    .mocked(watchlistHooks.useCreateWatchlist)
    .mockReturnValue({ mutate: createMutate, isPending: false } as never)
  jest
    .mocked(watchlistHooks.useDeleteWatchlist)
    .mockReturnValue({ mutate: deleteMutate, isPending: false } as never)
  jest
    .mocked(watchlistHooks.useRemoveFromWatchlistItems)
    .mockReturnValue({ mutate: removeMutate, isPending: false } as never)
}

beforeEach(() => {
  jest.clearAllMocks()
  mockHooks()
})

describe('WatchlistPanel', () => {
  it('lists the watchlists, showing the default as "Favorites"', () => {
    renderWithProviders(<WatchlistPanel />)
    expect(screen.getByRole('option', { name: /favorites/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /tech/i })).toBeInTheDocument()
  })

  it('renders the selected list’s items', () => {
    renderWithProviders(<WatchlistPanel />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('fetches the default list initially', () => {
    renderWithProviders(<WatchlistPanel />)
    expect(watchlistHooks.useWatchlistItems).toHaveBeenCalledWith(1)
  })

  it('switches the fetched list when another is selected', () => {
    renderWithProviders(<WatchlistPanel />)
    fireEvent.click(screen.getByRole('option', { name: /tech/i }))
    expect(watchlistHooks.useWatchlistItems).toHaveBeenLastCalledWith(2)
  })

  it('opens the create dialog from the New List button', () => {
    renderWithProviders(<WatchlistPanel />)
    fireEvent.click(screen.getByRole('button', { name: /new list/i }))
    expect(screen.getByText(/new watchlist/i)).toBeInTheDocument()
  })

  it('creates a list with the entered name', () => {
    renderWithProviders(<WatchlistPanel />)
    fireEvent.click(screen.getByRole('button', { name: /new list/i }))
    fireEvent.change(screen.getByLabelText(/list name/i), { target: { value: 'forex' } })
    fireEvent.click(screen.getByRole('button', { name: /create list/i }))
    expect(createMutate).toHaveBeenCalledWith('forex', expect.anything())
  })

  it('removes an item from the currently selected list', () => {
    renderWithProviders(<WatchlistPanel />)
    fireEvent.click(screen.getByRole('button', { name: /remove AAPL from watchlist/i }))
    expect(removeMutate).toHaveBeenCalledWith({ watchlistId: 1, listingId: 42 })
  })

  it('does not offer to delete the default list', () => {
    renderWithProviders(<WatchlistPanel />)
    expect(screen.queryByRole('button', { name: /delete list/i })).not.toBeInTheDocument()
  })

  it('offers to delete a non-default list and calls deleteWatchlist', () => {
    renderWithProviders(<WatchlistPanel />)
    fireEvent.click(screen.getByRole('option', { name: /tech/i }))
    fireEvent.click(screen.getByRole('button', { name: /delete list/i }))
    expect(deleteMutate).toHaveBeenCalledWith(2, expect.anything())
  })
})
