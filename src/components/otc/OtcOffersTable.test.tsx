import { render, screen, fireEvent } from '@testing-library/react'
import { OtcOffersTable } from '@/components/otc/OtcOffersTable'
import { createMockOtcOffer, createMockRemoteOtcOffer } from '@/__tests__/fixtures/otc-fixtures'

describe('OtcOffersTable', () => {
  const offers = [
    createMockOtcOffer({ id: 1, ticker: 'AAPL', quantity: 5, price_per_unit: '175.00' }),
    createMockOtcOffer({
      id: 2,
      ticker: 'MSFT',
      name: 'Microsoft',
      quantity: 3,
      price_per_unit: '420.00',
    }),
  ]
  const onBuy = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    render(<OtcOffersTable offers={offers} onBuy={onBuy} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
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
    fireEvent.click(screen.getAllByRole('button', { name: /^buy$/i })[0])
    expect(onBuy).toHaveBeenCalledWith(offers[0])
  })

  it('shows Negotiate button for remote offers and renders Quote on request when price is 0', () => {
    const remote = createMockRemoteOtcOffer({
      bank_code: '333',
      ticker: 'MSFT',
      quantity: 1,
      price_per_unit: '0',
      currency: 'USD',
    })
    render(<OtcOffersTable offers={[remote]} onBuy={onBuy} />)
    expect(screen.getByText(/quote on request/i)).toBeInTheDocument()
    expect(screen.getByText(/peer · 333/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /negotiate/i }))
    expect(onBuy).toHaveBeenCalledWith(remote)
  })

  it('renders price with currency for remote offers with non-zero price', () => {
    const remote = createMockRemoteOtcOffer({ price_per_unit: '420.50', currency: 'EUR' })
    render(<OtcOffersTable offers={[remote]} onBuy={onBuy} />)
    expect(screen.getByText('420.50 EUR')).toBeInTheDocument()
  })
})
