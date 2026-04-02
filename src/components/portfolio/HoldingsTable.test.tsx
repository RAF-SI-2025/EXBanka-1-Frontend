import { render, screen, fireEvent } from '@testing-library/react'
import { HoldingsTable } from '@/components/portfolio/HoldingsTable'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'

describe('HoldingsTable', () => {
  const holdings = [
    createMockHolding({
      id: 1,
      ticker: 'AAPL',
      name: 'Apple Inc.',
      quantity: 10,
      current_price: '185.00',
    }),
    createMockHolding({
      id: 2,
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
      quantity: 5,
      current_price: '420.00',
    }),
  ]

  it('renders table headers', () => {
    render(<HoldingsTable holdings={holdings} onSell={jest.fn()} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Current Price')).toBeInTheDocument()
  })

  it('renders each holding row', () => {
    render(<HoldingsTable holdings={holdings} onSell={jest.fn()} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('renders empty state when no holdings', () => {
    render(<HoldingsTable holdings={[]} onSell={jest.fn()} />)
    expect(screen.getByText(/no holdings/i)).toBeInTheDocument()
  })

  it('calls onSell with the holding when Sell is clicked', () => {
    const onSell = jest.fn()
    render(<HoldingsTable holdings={holdings} onSell={onSell} />)
    fireEvent.click(screen.getAllByRole('button', { name: /sell/i })[0])
    expect(onSell).toHaveBeenCalledWith(holdings[0])
  })
})
