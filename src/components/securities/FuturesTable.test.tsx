import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FuturesTable } from '@/components/securities/FuturesTable'
import { createMockFutures } from '@/__tests__/fixtures/security-fixtures'

const mockFutures = [
  createMockFutures({
    id: 1,
    ticker: 'CLJ26',
    name: 'Crude Oil Futures',
    price: '72.50',
    change: '-0.80',
    volume: 350000,
    settlement_date: '2026-04-15',
    exchange_acronym: 'NYMEX',
    initial_margin_cost: '7975.00',
  }),
  createMockFutures({
    id: 2,
    ticker: 'GCJ26',
    name: 'Gold Futures',
    price: '2050.00',
    change: '15.00',
    volume: 200000,
    settlement_date: '2026-04-20',
    exchange_acronym: 'COMEX',
    initial_margin_cost: '11275.00',
  }),
]

describe('FuturesTable', () => {
  const defaultProps = {
    futures: mockFutures,
    onRowClick: jest.fn(),
    onBuy: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<FuturesTable {...defaultProps} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Settlement')).toBeInTheDocument()
    expect(screen.getByText('Exchange')).toBeInTheDocument()
  })

  it('renders futures rows', () => {
    renderWithProviders(<FuturesTable {...defaultProps} />)
    expect(screen.getByText('CLJ26')).toBeInTheDocument()
    expect(screen.getByText('Crude Oil Futures')).toBeInTheDocument()
    expect(screen.getByText('GCJ26')).toBeInTheDocument()
    expect(screen.getByText('2026-04-15')).toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', () => {
    renderWithProviders(<FuturesTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Crude Oil Futures'))
    expect(defaultProps.onRowClick).toHaveBeenCalledWith(1)
  })

  it('calls onBuy when Buy button is clicked', () => {
    renderWithProviders(<FuturesTable {...defaultProps} />)
    const buyButtons = screen.getAllByRole('button', { name: /buy/i })
    fireEvent.click(buyButtons[0])
    expect(defaultProps.onBuy).toHaveBeenCalledWith(mockFutures[0])
    expect(defaultProps.onRowClick).not.toHaveBeenCalled()
  })
})
