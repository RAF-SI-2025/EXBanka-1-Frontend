import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { StockExchangeTable } from '@/components/stockExchanges/StockExchangeTable'
import { createMockStockExchange } from '@/__tests__/fixtures/stockExchange-fixtures'

const mockExchanges = [
  createMockStockExchange({
    id: 1,
    exchange_name: 'New York Stock Exchange',
    exchange_acronym: 'NYSE',
    exchange_mic_code: 'XNYS',
    polity: 'United States',
    currency: 'Dollar',
    time_zone: '-5',
  }),
  createMockStockExchange({
    id: 2,
    exchange_name: 'London Stock Exchange',
    exchange_acronym: 'LSE',
    exchange_mic_code: 'XLON',
    polity: 'United Kingdom',
    currency: 'Pound',
    time_zone: '0',
  }),
]

describe('StockExchangeTable', () => {
  it('renders table headers', () => {
    renderWithProviders(<StockExchangeTable exchanges={mockExchanges} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Acronym')).toBeInTheDocument()
    expect(screen.getByText('MIC Code')).toBeInTheDocument()
    expect(screen.getByText('Country')).toBeInTheDocument()
    expect(screen.getByText('Currency')).toBeInTheDocument()
    expect(screen.getByText('Time Zone')).toBeInTheDocument()
  })

  it('renders exchange rows', () => {
    renderWithProviders(<StockExchangeTable exchanges={mockExchanges} />)
    expect(screen.getByText('New York Stock Exchange')).toBeInTheDocument()
    expect(screen.getByText('NYSE')).toBeInTheDocument()
    expect(screen.getByText('XNYS')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('London Stock Exchange')).toBeInTheDocument()
    expect(screen.getByText('LSE')).toBeInTheDocument()
  })

  it('formats time zone with UTC prefix', () => {
    renderWithProviders(<StockExchangeTable exchanges={mockExchanges} />)
    expect(screen.getByText('UTC-5')).toBeInTheDocument()
    expect(screen.getByText('UTC+0')).toBeInTheDocument()
  })
})
