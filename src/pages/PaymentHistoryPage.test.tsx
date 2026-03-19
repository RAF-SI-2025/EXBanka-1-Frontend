import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PaymentHistoryPage } from '@/pages/PaymentHistoryPage'
import * as usePaymentsHook from '@/hooks/usePayments'
import * as useAccountsHook from '@/hooks/useAccounts'

jest.mock('@/hooks/usePayments')
jest.mock('@/hooks/useAccounts')

describe('PaymentHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
  })

  it('renders payment history page', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByText(/istorija plaćanja/i)).toBeInTheDocument()
  })
})
