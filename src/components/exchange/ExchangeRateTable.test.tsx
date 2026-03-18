import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ExchangeRateTable } from '@/components/exchange/ExchangeRateTable'

const mockRates = [
  { currency_code: 'EUR', currency_name: 'Euro', buy_rate: 116.5, sell_rate: 117.8 },
  { currency_code: 'USD', currency_name: 'US Dollar', buy_rate: 106.2, sell_rate: 107.5 },
]

describe('ExchangeRateTable', () => {
  it('renders all currency rates', () => {
    renderWithProviders(<ExchangeRateTable rates={mockRates} />)
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('Euro')).toBeInTheDocument()
  })

  it('shows buy and sell columns', () => {
    renderWithProviders(<ExchangeRateTable rates={mockRates} />)
    expect(screen.getByText(/kupovni/i)).toBeInTheDocument()
    expect(screen.getByText(/prodajni/i)).toBeInTheDocument()
    expect(screen.getByText('116.50')).toBeInTheDocument()
    expect(screen.getByText('117.80')).toBeInTheDocument()
  })

  it('shows empty state when no rates', () => {
    renderWithProviders(<ExchangeRateTable rates={[]} />)
    expect(screen.getByText(/nema podataka/i)).toBeInTheDocument()
  })
})
