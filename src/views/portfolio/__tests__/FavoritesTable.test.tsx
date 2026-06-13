import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FavoritesTable } from '@/views/portfolio/components/FavoritesTable'
import type { WatchlistItem } from '@/types/watchlist'

const sample: WatchlistItem = {
  id: 1,
  listing_id: 42,
  security_type: 'stock',
  ticker: 'AAPL',
  current_price: '187.45',
  daily_change: '1.25',
  daily_change_percent: '0.67',
  added_at_unix: 1731699200,
}

describe('FavoritesTable', () => {
  it('shows an empty-state message when there are no items', () => {
    renderWithProviders(<FavoritesTable items={[]} onRemove={() => {}} />)
    expect(screen.getByText(/Your watchlist is empty/i)).toBeInTheDocument()
  })

  it('renders one row per watchlist item with ticker and a Remove button', () => {
    renderWithProviders(<FavoritesTable items={[sample]} onRemove={() => {}} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Remove AAPL from watchlist/i })).toBeInTheDocument()
  })

  it('calls onRemove with the listing_id when Remove is clicked', () => {
    const onRemove = jest.fn()
    renderWithProviders(<FavoritesTable items={[sample]} onRemove={onRemove} />)
    fireEvent.click(screen.getByRole('button', { name: /Remove AAPL/i }))
    expect(onRemove).toHaveBeenCalledWith(42)
  })

  it('disables the Remove button when busyListingId matches the row', () => {
    renderWithProviders(<FavoritesTable items={[sample]} onRemove={() => {}} busyListingId={42} />)
    expect(screen.getByRole('button', { name: /Remove AAPL/i })).toBeDisabled()
  })

  it('renders a Buy button per row when onOrder is provided and passes the full item on click', () => {
    const onOrder = jest.fn()
    renderWithProviders(<FavoritesTable items={[sample]} onRemove={() => {}} onOrder={onOrder} />)
    const buy = screen.getByRole('button', { name: /Create order for AAPL/i })
    expect(buy).toHaveTextContent('Buy')
    fireEvent.click(buy)
    expect(onOrder).toHaveBeenCalledWith(sample)
  })

  it('renders the Buy button before the Remove button in the Actions cell', () => {
    renderWithProviders(<FavoritesTable items={[sample]} onRemove={() => {}} onOrder={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAccessibleName('Create order for AAPL')
    expect(buttons[1]).toHaveAccessibleName('Remove AAPL from watchlist')
  })

  it('does not render a Buy button when onOrder is not provided', () => {
    renderWithProviders(<FavoritesTable items={[sample]} onRemove={() => {}} />)
    expect(screen.queryByRole('button', { name: /Create order/i })).not.toBeInTheDocument()
  })

  it('keeps Remove working when onOrder is provided', () => {
    const onRemove = jest.fn()
    renderWithProviders(<FavoritesTable items={[sample]} onRemove={onRemove} onOrder={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Remove AAPL/i }))
    expect(onRemove).toHaveBeenCalledWith(42)
  })
})
