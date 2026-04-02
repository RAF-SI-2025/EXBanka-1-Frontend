import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ExchangeRatesPage } from '@/pages/ExchangeRatesPage'
import * as useExchangeHook from '@/hooks/useExchange'

jest.mock('@/hooks/useExchange')

describe('ExchangeRatesPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders exchange rate table', () => {
    jest.mocked(useExchangeHook.useExchangeRates).mockReturnValue({
      data: [
        {
          from_currency: 'EUR',
          to_currency: 'RSD',
          buy_rate: 116.5,
          sell_rate: 117.8,
          updated_at: '2026-03-13T08:00:00Z',
        },
      ],
      isLoading: false,
    } as any)

    renderWithProviders(<ExchangeRatesPage />)
    expect(screen.getByText(/exchange rates/i)).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(useExchangeHook.useExchangeRates).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)

    renderWithProviders(<ExchangeRatesPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
