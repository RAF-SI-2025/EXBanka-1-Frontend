import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ExchangeRatesView } from '@/views/exchangeRates/ExchangeRatesView'
import * as useExchangeHook from '@/hooks/useExchange'

jest.mock('@/hooks/useExchange')

describe('ExchangeRatesView', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders heading inside the animated shell and the rate table', () => {
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
    } as ReturnType<typeof useExchangeHook.useExchangeRates>)

    renderWithProviders(<ExchangeRatesView />)
    expect(screen.getByRole('heading', { name: /exchange rates/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId('view-shell')).toHaveClass('animate-in')
    expect(screen.getByText('EUR')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    jest.mocked(useExchangeHook.useExchangeRates).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useExchangeHook.useExchangeRates>)

    renderWithProviders(<ExchangeRatesView />)
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })
})
