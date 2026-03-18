import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { QuickPayment } from '@/components/home/QuickPayment'
import * as usePaymentsHook from '@/hooks/usePayments'

jest.mock('@/hooks/usePayments')

describe('QuickPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
  })

  it('renders section title', () => {
    renderWithProviders(<QuickPayment />)
    expect(screen.getByText(/sačuvani primaoci/i)).toBeInTheDocument()
  })

  it('shows empty state when no recipients', () => {
    renderWithProviders(<QuickPayment />)
    expect(screen.getByText(/nema sačuvanih primalaca/i)).toBeInTheDocument()
  })
})
