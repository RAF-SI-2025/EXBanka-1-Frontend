import { render, screen, fireEvent } from '@testing-library/react'
import { OtcOffersTable } from '@/components/otc/OtcOffersTable'
import { createMockOtcOffer } from '@/__tests__/fixtures/otc-fixtures'

describe('OtcOffersTable', () => {
  const offers = [
    createMockOtcOffer({ id: 1, ticker: 'AAPL', quantity: 5, price: '175.00' }),
    createMockOtcOffer({ id: 2, ticker: 'MSFT', name: 'Microsoft', quantity: 3, price: '420.00' }),
  ]
  const onBuy = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    render(<OtcOffersTable offers={offers} onBuy={onBuy} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
  })

  it('renders each offer row', () => {
    render(<OtcOffersTable offers={offers} onBuy={onBuy} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('renders empty state when no offers', () => {
    render(<OtcOffersTable offers={[]} onBuy={onBuy} />)
    expect(screen.getByText(/no offers/i)).toBeInTheDocument()
  })

  it('calls onBuy with the offer when Buy is clicked', () => {
    render(<OtcOffersTable offers={offers} onBuy={onBuy} />)
    fireEvent.click(screen.getAllByRole('button', { name: /buy/i })[0])
    expect(onBuy).toHaveBeenCalledWith(offers[0])
  })
})
