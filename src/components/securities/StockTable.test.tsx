import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { StockTable } from '@/components/securities/StockTable'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'

const mockStocks = [
  createMockStock({
    id: 1,
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: '178.50',
    change: '2.30',
    volume: 52000000,
    exchange_acronym: 'NYSE',
    initial_margin_cost: '98.18',
  }),
  createMockStock({
    id: 2,
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    price: '420.00',
    change: '-1.50',
    volume: 25000000,
    exchange_acronym: 'NASDAQ',
    initial_margin_cost: '231.00',
  }),
]

describe('StockTable', () => {
  const defaultProps = {
    stocks: mockStocks,
    onRowClick: jest.fn(),
    onBuy: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<StockTable {...defaultProps} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
    expect(screen.getByText('Volume')).toBeInTheDocument()
    expect(screen.getByText('Exchange')).toBeInTheDocument()
    expect(screen.getByText('Margin Cost')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders stock rows', () => {
    renderWithProviders(<StockTable {...defaultProps} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('178.50')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument()
  })

  it('formats positive change with + prefix', () => {
    renderWithProviders(<StockTable {...defaultProps} />)
    expect(screen.getByText('+2.30')).toBeInTheDocument()
  })

  it('formats negative change without prefix', () => {
    renderWithProviders(<StockTable {...defaultProps} />)
    expect(screen.getByText('-1.50')).toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', () => {
    renderWithProviders(<StockTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Apple Inc.'))
    expect(defaultProps.onRowClick).toHaveBeenCalledWith(1)
  })

  it('calls onBuy when Buy button is clicked without triggering row click', () => {
    renderWithProviders(<StockTable {...defaultProps} />)
    const buyButtons = screen.getAllByRole('button', { name: /buy/i })
    fireEvent.click(buyButtons[0])
    expect(defaultProps.onBuy).toHaveBeenCalledWith(mockStocks[0])
    expect(defaultProps.onRowClick).not.toHaveBeenCalled()
  })
})
