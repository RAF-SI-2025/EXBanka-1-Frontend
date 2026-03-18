import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PaymentHistoryPage } from '@/pages/PaymentHistoryPage'
import * as usePaymentsHook from '@/hooks/usePayments'

jest.mock('@/hooks/usePayments')

describe('PaymentHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total_count: 0 },
      isLoading: false,
    } as any)
  })

  it('renders payment history page', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByText(/istorija plaćanja/i)).toBeInTheDocument()
  })
})
