import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ExchangeRateTable } from '@/components/exchange/ExchangeRateTable'

const mockRates = [
  {
    from_currency: 'EUR',
    to_currency: 'RSD',
    buy_rate: 116.5,
    sell_rate: 117.8,
    updated_at: '2026-03-13T08:00:00Z',
  },
  {
    from_currency: 'USD',
    to_currency: 'RSD',
    buy_rate: 106.2,
    sell_rate: 107.5,
    updated_at: '2026-03-13T08:00:00Z',
  },
]

describe('ExchangeRateTable', () => {
  it('renders all currency rates', () => {
    renderWithProviders(<ExchangeRateTable rates={mockRates} />)
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  it('shows buy and sell columns', () => {
    renderWithProviders(<ExchangeRateTable rates={mockRates} />)
    expect(screen.getByText(/buy rate/i)).toBeInTheDocument()
    expect(screen.getByText(/sell rate/i)).toBeInTheDocument()
    expect(screen.getByText('116.50')).toBeInTheDocument()
    expect(screen.getByText('117.80')).toBeInTheDocument()
  })

  it('shows empty state when no rates', () => {
    renderWithProviders(<ExchangeRateTable rates={[]} />)
    expect(screen.getByText(/no exchange rate data/i)).toBeInTheDocument()
  })

  it('renders rate values returned as strings from API without crashing', () => {
    const ratesWithStringValues = [
      {
        from_currency: 'EUR',
        to_currency: 'RSD',
        buy_rate: '116.50' as unknown as number,
        sell_rate: '117.80' as unknown as number,
        updated_at: '2026-03-13T08:00:00Z',
      },
    ]
    renderWithProviders(<ExchangeRateTable rates={ratesWithStringValues} />)
    expect(screen.getByText('116.50')).toBeInTheDocument()
    expect(screen.getByText('117.80')).toBeInTheDocument()
  })
})
