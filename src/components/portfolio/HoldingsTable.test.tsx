import { render, screen, fireEvent } from '@testing-library/react'
import { HoldingsTable } from '@/components/portfolio/HoldingsTable'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'

describe('HoldingsTable', () => {
  const stockHolding = createMockHolding({
    id: 1,
    ticker: 'AAPL',
    security_type: 'stock',
    quantity: 10,
    current_price: '185.00',
    profit_loss: '350.00',
    public_quantity: 2,
  })
  const optionHolding = createMockHolding({
    id: 2,
    ticker: 'MSFT-OPT',
    security_type: 'option',
    quantity: 5,
  })
  const onSell = jest.fn()
  const onMakePublic = jest.fn()
  const onExercise = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  const renderTable = (holdings = [stockHolding]) =>
    render(
      <HoldingsTable
        holdings={holdings}
        onSell={onSell}
        onMakePublic={onMakePublic}
        onExercise={onExercise}
      />
    )

  it('renders table headers including P&L', () => {
    renderTable()
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Current Price')).toBeInTheDocument()
  })

  it('renders holding row data', () => {
    renderTable()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('350.00')).toBeInTheDocument()
  })

  it('renders empty state when no holdings', () => {
    renderTable([])
    expect(screen.getByText(/no holdings/i)).toBeInTheDocument()
  })

  it('calls onSell when Sell is clicked', () => {
    renderTable()
    fireEvent.click(screen.getByRole('button', { name: /sell/i }))
    expect(onSell).toHaveBeenCalledWith(stockHolding)
  })

  it('shows Make Public button for stocks and calls onMakePublic', () => {
    renderTable()
    fireEvent.click(screen.getByRole('button', { name: /make public/i }))
    expect(onMakePublic).toHaveBeenCalledWith(stockHolding)
  })

  it('does not show Make Public button for options', () => {
    renderTable([optionHolding])
    expect(screen.queryByRole('button', { name: /make public/i })).not.toBeInTheDocument()
  })

  it('shows Exercise button for options and calls onExercise', () => {
    renderTable([optionHolding])
    fireEvent.click(screen.getByRole('button', { name: /exercise/i }))
    expect(onExercise).toHaveBeenCalledWith(optionHolding)
  })
})
