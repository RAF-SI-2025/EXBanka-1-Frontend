import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { NewPaymentPage } from '@/pages/NewPaymentPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as usePaymentsHook from '@/hooks/usePayments'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/usePayments')

describe('NewPaymentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total_count: 0 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
  })

  it('renders payment form', () => {
    renderWithProviders(<NewPaymentPage />)
    expect(screen.getByText(/nova uplata/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/broj računa primaoca/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/iznos/i)).toBeInTheDocument()
  })
})
