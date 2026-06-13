import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PaymentRecipientsView } from '@/views/paymentRecipients/PaymentRecipientsView'
import * as usePaymentsHook from '@/hooks/usePayments'
import { createMockPaymentRecipient } from '@/__tests__/fixtures/payment-fixtures'

jest.mock('@/hooks/usePayments')

// The three payment-recipient mutation hooks each have a different `mutate`
// signature; one untyped stub keeps the test concise without weakening the
// runtime behaviour we actually care about (mutate spies + isPending flag).
function mutationStub<T>(): T {
  return { mutate: jest.fn(), isPending: false } as unknown as T
}

function queryStub<T>(data: ReturnType<typeof usePaymentsHook.usePaymentRecipients>['data']): T {
  return { data, isLoading: false } as unknown as T
}

describe('PaymentRecipientsView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue(queryStub([]))
    jest
      .mocked(usePaymentsHook.useCreatePaymentRecipient)
      .mockReturnValue(mutationStub<ReturnType<typeof usePaymentsHook.useCreatePaymentRecipient>>())
    jest
      .mocked(usePaymentsHook.useDeletePaymentRecipient)
      .mockReturnValue(mutationStub<ReturnType<typeof usePaymentsHook.useDeletePaymentRecipient>>())
    jest
      .mocked(usePaymentsHook.useUpdatePaymentRecipient)
      .mockReturnValue(mutationStub<ReturnType<typeof usePaymentsHook.useUpdatePaymentRecipient>>())
  })

  it('renders title, shell, and Add button', () => {
    renderWithProviders(<PaymentRecipientsView />)
    expect(screen.getByText('Saved Recipients')).toBeInTheDocument()
    expect(screen.getByTestId('view-shell')).toHaveClass('animate-in')
    expect(screen.getByRole('button', { name: /add recipient/i })).toBeInTheDocument()
  })

  it('renders edit button for each recipient', () => {
    jest
      .mocked(usePaymentsHook.usePaymentRecipients)
      .mockReturnValue(
        queryStub<ReturnType<typeof usePaymentsHook.usePaymentRecipients>>([
          createMockPaymentRecipient(),
        ])
      )
    renderWithProviders(<PaymentRecipientsView />)
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog before deleting a recipient', async () => {
    jest
      .mocked(usePaymentsHook.usePaymentRecipients)
      .mockReturnValue(
        queryStub<ReturnType<typeof usePaymentsHook.usePaymentRecipients>>([
          createMockPaymentRecipient(),
        ])
      )
    renderWithProviders(<PaymentRecipientsView />)

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(screen.getByText('Delete Recipient?')).toBeInTheDocument()
  })

  it('pre-fills form when edit button is clicked', async () => {
    const recipient = createMockPaymentRecipient()
    jest
      .mocked(usePaymentsHook.usePaymentRecipients)
      .mockReturnValue(
        queryStub<ReturnType<typeof usePaymentsHook.usePaymentRecipients>>([recipient])
      )

    renderWithProviders(<PaymentRecipientsView />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByDisplayValue(recipient.recipient_name)).toBeInTheDocument()
    expect(screen.getByDisplayValue(recipient.account_number)).toBeInTheDocument()
    expect(screen.getByText(/edit recipient/i)).toBeInTheDocument()
  })
})
