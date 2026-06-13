import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { WatchlistButton } from '@/views/securities/components/WatchlistButton'

describe('WatchlistButton', () => {
  it('renders an "add" label and unfilled heart when not in any list', () => {
    renderWithProviders(
      <WatchlistButton listingId={1} ticker="AAPL" inWatchlist={false} onOpen={() => {}} />
    )
    const btn = screen.getByRole('button', { name: /add AAPL to watchlist/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    const heart = btn.querySelector('svg')
    expect(heart).not.toHaveClass('fill-red-500')
  })

  it('renders a "manage" label and filled heart when in at least one list', () => {
    renderWithProviders(
      <WatchlistButton listingId={1} ticker="AAPL" inWatchlist={true} onOpen={() => {}} />
    )
    const btn = screen.getByRole('button', { name: /manage AAPL in watchlists/i })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    const heart = btn.querySelector('svg')
    expect(heart).toHaveClass('fill-red-500')
  })

  it('forwards listingId + ticker to onOpen on click', () => {
    const onOpen = jest.fn()
    renderWithProviders(
      <WatchlistButton listingId={42} ticker="AAPL" inWatchlist={false} onOpen={onOpen} />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onOpen).toHaveBeenCalledWith(42, 'AAPL')
  })
})
