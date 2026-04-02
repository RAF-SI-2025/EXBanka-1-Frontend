import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ExchangeCalculatorPage } from '@/pages/ExchangeCalculatorPage'
import * as useExchangeHook from '@/hooks/useExchange'

jest.mock('@/hooks/useExchange')

describe('ExchangeCalculatorPage', () => {
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
    renderWithProviders(<ExchangeCalculatorPage />)
    expect(screen.getByText(/check equivalence/i)).toBeInTheDocument()
  })
})
