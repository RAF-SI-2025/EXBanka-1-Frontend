import { render, screen, fireEvent } from '@testing-library/react'
import { SecuritiesTable } from '@/components/securities/SecuritiesTable'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'

describe('SecuritiesTable', () => {
  const stocks = [
    createMockStock({ id: 1, ticker: 'AAPL', name: 'Apple Inc.', ask: '185.00', bid: '184.90' }),
    createMockStock({
      id: 2,
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
      ask: '420.00',
      bid: '419.50',
    }),
  ]

  it('renders table headers', () => {
    render(<SecuritiesTable securities={stocks} onBuy={jest.fn()} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Ask')).toBeInTheDocument()
    expect(screen.getByText('Bid')).toBeInTheDocument()
  })

  it('renders each security row', () => {
    render(<SecuritiesTable securities={stocks} onBuy={jest.fn()} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  it('renders empty state when no securities', () => {
    render(<SecuritiesTable securities={[]} onBuy={jest.fn()} />)
    expect(screen.getByText(/no securities/i)).toBeInTheDocument()
  })

  it('calls onBuy with the security when Buy is clicked', () => {
    const onBuy = jest.fn()
    render(<SecuritiesTable securities={stocks} onBuy={onBuy} />)
    fireEvent.click(screen.getAllByRole('button', { name: /buy/i })[0])
    expect(onBuy).toHaveBeenCalledWith(stocks[0])
  })
})
