import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PaymentRecipientsPage } from '@/pages/PaymentRecipientsPage'
import * as usePaymentsHook from '@/hooks/usePayments'
import { createMockPaymentRecipient } from '@/__tests__/fixtures/payment-fixtures'

jest.mock('@/hooks/usePayments')

describe('PaymentRecipientsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.useCreatePaymentRecipient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(usePaymentsHook.useDeletePaymentRecipient).mockReturnValue({
      mutate: jest.fn(),
    } as any)
    jest.mocked(usePaymentsHook.useUpdatePaymentRecipient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
  })

  it('renders recipients page', () => {
    renderWithProviders(<PaymentRecipientsPage />)
    expect(screen.getByText(/sačuvani primaoci/i)).toBeInTheDocument()
    expect(screen.getByText(/dodaj primaoca/i)).toBeInTheDocument()
  })

  it('renders edit button for each recipient', () => {
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [createMockPaymentRecipient()],
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.useUpdatePaymentRecipient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    renderWithProviders(<PaymentRecipientsPage />)
    expect(screen.getByRole('button', { name: /izmeni/i })).toBeInTheDocument()
  })
})
