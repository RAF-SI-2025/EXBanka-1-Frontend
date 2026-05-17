import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ExchangeCalculatorView } from '@/views/exchangeRates/ExchangeCalculatorView'
import * as useExchangeHook from '@/hooks/useExchange'

jest.mock('@/hooks/useExchange')

describe('ExchangeCalculatorView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useExchangeHook.useConvertCurrency).mockReturnValue({
      mutate: jest.fn(),
      data: null,
      isPending: false,
      isError: false,
      variables: undefined,
    } as any)
    jest.mocked(useExchangeHook.useExchangeRates).mockReturnValue({
      data: [],
    } as any)
  })

  it('renders calculator', () => {
    renderWithProviders(<ExchangeCalculatorView />)
    expect(screen.getByText(/check equivalence/i)).toBeInTheDocument()
  })
})
