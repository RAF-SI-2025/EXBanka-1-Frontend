import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AddToWatchlistDialog } from '@/views/securities/components/AddToWatchlistDialog'
import type { Watchlist } from '@/types/watchlist'

jest.mock('@/components/ui/select', () => jest.requireActual('@/__tests__/mocks/select-mock'))

const watchlists: Watchlist[] = [
  { id: 1, name: 'My Watchlist', item_count: 0, created_at: 1 },
  { id: 2, name: 'tech', item_count: 3, created_at: 2 },
]

function setup(overrides: Partial<React.ComponentProps<typeof AddToWatchlistDialog>> = {}) {
  const props = {
    open: true,
    onOpenChange: jest.fn(),
    listing: { listing_id: 42, ticker: 'AAPL' },
    watchlists,
    onSubmit: jest.fn(),
    loading: false,
    ...overrides,
  }
  renderWithProviders(<AddToWatchlistDialog {...props} />)
  return props
}

describe('AddToWatchlistDialog', () => {
  it('renders the listing ticker in the title', () => {
    setup()
    expect(screen.getByText(/AAPL/)).toBeInTheDocument()
  })

  it('renders an option per list, relabelling the default as "Favorites"', () => {
    setup()
    expect(screen.getByRole('option', { name: /favorites/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /tech/i })).toBeInTheDocument()
  })

  it('submits the first list id by default on confirm', () => {
    const onSubmit = jest.fn()
    setup({ onSubmit })
    fireEvent.click(screen.getByRole('button', { name: /add to list/i }))
    expect(onSubmit).toHaveBeenCalledWith(1)
  })

  it('submits the selected list id', () => {
    const onSubmit = jest.fn()
    setup({ onSubmit })
    fireEvent.click(screen.getByRole('option', { name: /tech/i }))
    fireEvent.click(screen.getByRole('button', { name: /add to list/i }))
    expect(onSubmit).toHaveBeenCalledWith(2)
  })

  it('calls onOpenChange(false) when Cancel is clicked', () => {
    const onOpenChange = jest.fn()
    setup({ onOpenChange })
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables submit when the user has no lists', () => {
    setup({ watchlists: [] })
    expect(screen.getByRole('button', { name: /add to list/i })).toBeDisabled()
  })
})
