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
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.useCreatePaymentRecipient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
  })

  it('renders payment form', () => {
    renderWithProviders(<NewPaymentPage />)
    expect(screen.getByText(/new payment/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/recipient account number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })

  it('shows Save Recipient prompt on success when recipient is not saved', () => {
    jest.mocked(usePaymentsHook.useCreatePaymentRecipient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<NewPaymentPage />, {
      preloadedState: {
        payment: {
          step: 'success',
          flowType: 'payment' as const,
          result: { id: 1 },
          formData: {
            from_account_number: '111',
            to_account_number: '999',
            recipient_name: 'Test User',
            amount: 100,
            payment_code: '289',
          },
          submitting: false,
          error: null,
          transactionId: null,
          codeRequested: false,
          verificationError: null,
        },
      },
    })

    expect(screen.getByText(/save recipient/i)).toBeInTheDocument()
  })
})
