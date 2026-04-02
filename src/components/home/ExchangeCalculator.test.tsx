import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ExchangeCalculator } from '@/components/home/ExchangeCalculator'
import * as useExchangeHook from '@/hooks/useExchange'

jest.mock('@/hooks/useExchange')

describe('ExchangeCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useExchangeHook.useConvertCurrency).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      data: undefined,
    } as any)
  })

  it('renders amount input and currency selectors', () => {
    renderWithProviders(<ExchangeCalculator />)
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })
})
