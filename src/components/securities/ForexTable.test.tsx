import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ForexTable } from '@/components/securities/ForexTable'
import { createMockForex } from '@/__tests__/fixtures/security-fixtures'

const mockForex = [
  createMockForex({
    id: 1,
    ticker: 'EUR/USD',
    name: 'Euro to US Dollar',
    base_currency: 'EUR',
    quote_currency: 'USD',
    exchange_rate: '1.0850',
    liquidity: 'high',
    price: '1.0850',
    change: '0.0012',
  }),
  createMockForex({
    id: 2,
    ticker: 'GBP/USD',
    name: 'British Pound to US Dollar',
    base_currency: 'GBP',
    quote_currency: 'USD',
    exchange_rate: '1.2640',
    liquidity: 'medium',
    price: '1.2640',
    change: '-0.0015',
  }),
]

describe('ForexTable', () => {
  const defaultProps = {
    pairs: mockForex,
    onRowClick: jest.fn(),
    onBuy: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<ForexTable {...defaultProps} />)
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Rate')).toBeInTheDocument()
    expect(screen.getByText('Liquidity')).toBeInTheDocument()
  })

  it('renders forex rows', () => {
    renderWithProviders(<ForexTable {...defaultProps} />)
    expect(screen.getByText('EUR/USD')).toBeInTheDocument()
    expect(screen.getByText('Euro to US Dollar')).toBeInTheDocument()
    expect(screen.getByText('GBP/USD')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', () => {
    renderWithProviders(<ForexTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Euro to US Dollar'))
    expect(defaultProps.onRowClick).toHaveBeenCalledWith(1)
  })

  it('calls onBuy when Buy button is clicked', () => {
    renderWithProviders(<ForexTable {...defaultProps} />)
    const buyButtons = screen.getAllByRole('button', { name: /buy/i })
    fireEvent.click(buyButtons[0])
    expect(defaultProps.onBuy).toHaveBeenCalledWith(mockForex[0])
    expect(defaultProps.onRowClick).not.toHaveBeenCalled()
  })
})
