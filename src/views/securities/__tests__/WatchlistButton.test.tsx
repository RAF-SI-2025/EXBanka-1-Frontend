import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { WatchlistButton } from '@/views/securities/components/WatchlistButton'

describe('WatchlistButton', () => {
  it('renders an "add" label and unfilled heart when not in the watchlist', () => {
    renderWithProviders(
      <WatchlistButton listingId={1} ticker="AAPL" inWatchlist={false} onToggle={() => {}} />
    )
    const btn = screen.getByRole('button', { name: /add AAPL to watchlist/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    const heart = btn.querySelector('svg')
    expect(heart).not.toHaveClass('fill-red-500')
  })

  it('renders a "remove" label and filled heart when in the watchlist', () => {
    renderWithProviders(
      <WatchlistButton listingId={1} ticker="AAPL" inWatchlist={true} onToggle={() => {}} />
    )
    const btn = screen.getByRole('button', { name: /remove AAPL from watchlist/i })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    const heart = btn.querySelector('svg')
    expect(heart).toHaveClass('fill-red-500')
  })

  it('forwards listingId + current state to onToggle on click', () => {
    const toggle = jest.fn()
    renderWithProviders(
      <WatchlistButton listingId={42} ticker="AAPL" inWatchlist={false} onToggle={toggle} />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(toggle).toHaveBeenCalledWith(42, false)
  })
})
