import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OtcOptionOffersTable } from '@/components/otc/OtcOptionOffersTable'
import { createMockOtcOptionOffer } from '@/__tests__/fixtures/otcOption-fixtures'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('OtcOptionOffersTable', () => {
  it('renders the ticker in the Stock column when provided', () => {
    const offer = createMockOtcOptionOffer({ ticker: 'AAPL', stock_id: 42 })
    renderWithRouter(<OtcOptionOffersTable offers={[offer]} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.queryByText('#42')).not.toBeInTheDocument()
  })

  it('falls back to #stock_id when ticker is not present', () => {
    const offer = createMockOtcOptionOffer({ ticker: undefined, stock_id: 42 })
    renderWithRouter(<OtcOptionOffersTable offers={[offer]} />)
    expect(screen.getByText('#42')).toBeInTheDocument()
  })

  it('renders the status badge with the offer status', () => {
    const offer = createMockOtcOptionOffer({ status: 'open' })
    renderWithRouter(<OtcOptionOffersTable offers={[offer]} />)
    expect(screen.getByText(/open/i)).toBeInTheDocument()
  })

  it('renders an "open" status when an All-tab listing omits status', () => {
    // /otc/options returns entries without a `status` field — only open
    // listings appear in that view. Show "open" instead of an empty cell.
    const offer = createMockOtcOptionOffer({ status: undefined as unknown as 'open' })
    renderWithRouter(<OtcOptionOffersTable offers={[offer]} />)
    expect(screen.getByText(/open/i)).toBeInTheDocument()
  })

  it('renders the empty state when there are no offers', () => {
    renderWithRouter(<OtcOptionOffersTable offers={[]} />)
    expect(screen.getByText(/no offers/i)).toBeInTheDocument()
  })

  describe('Action column', () => {
    it('renders an Action column header', () => {
      const offer = createMockOtcOptionOffer({ ticker: 'AAPL' })
      renderWithRouter(<OtcOptionOffersTable offers={[offer]} />)
      expect(screen.getByRole('columnheader', { name: /action/i })).toBeInTheDocument()
    })

    it('renders a Bid button when the current user is not the offer owner', () => {
      const offer = createMockOtcOptionOffer({
        ticker: 'AAPL',
        initiator: { owner_type: 'client', owner_id: 7 },
      })
      const onBid = jest.fn()
      renderWithRouter(
        <OtcOptionOffersTable offers={[offer]} currentUserId={99} onBid={onBid} />
      )
      expect(screen.getByRole('button', { name: /^bid$/i })).toBeInTheDocument()
    })

    it('calls onBid with the offer when Bid is clicked', () => {
      const offer = createMockOtcOptionOffer({
        ticker: 'AAPL',
        initiator: { owner_type: 'client', owner_id: 7 },
      })
      const onBid = jest.fn()
      renderWithRouter(
        <OtcOptionOffersTable offers={[offer]} currentUserId={99} onBid={onBid} />
      )
      screen.getByRole('button', { name: /^bid$/i }).click()
      expect(onBid).toHaveBeenCalledWith(offer)
    })

    it('hides the Bid button when the current user owns the offer', () => {
      const offer = createMockOtcOptionOffer({
        ticker: 'AAPL',
        initiator: { owner_type: 'client', owner_id: 7 },
      })
      const onBid = jest.fn()
      renderWithRouter(
        <OtcOptionOffersTable offers={[offer]} currentUserId={7} onBid={onBid} />
      )
      expect(screen.queryByRole('button', { name: /^bid$/i })).not.toBeInTheDocument()
    })

    it('renders a "Your offer" indicator when the current user is the owner', () => {
      const offer = createMockOtcOptionOffer({
        ticker: 'AAPL',
        initiator: { owner_type: 'client', owner_id: 7 },
      })
      renderWithRouter(<OtcOptionOffersTable offers={[offer]} currentUserId={7} />)
      expect(screen.getByText(/your offer/i)).toBeInTheDocument()
    })

    it('makes the whole row a link to the offer detail page so owners can see bids', () => {
      // Direction badge alone isn't enough — clicking anywhere on a row
      // (especially for the owner, who has no Bid button) should navigate.
      const offer = createMockOtcOptionOffer({
        id: 1001,
        ticker: 'AAPL',
        initiator: { owner_type: 'client', owner_id: 7 },
      })
      renderWithRouter(<OtcOptionOffersTable offers={[offer]} currentUserId={7} />)
      const rowLink = screen.getByRole('link', { name: /AAPL/ })
      expect(rowLink).toHaveAttribute('href', '/otc/offers/1001')
    })
  })
})
