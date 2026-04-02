import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    expect(screen.getByText('Saved Recipients')).toBeInTheDocument()
    expect(screen.getByText(/add recipient/i)).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog before deleting a recipient', async () => {
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [createMockPaymentRecipient()],
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentRecipientsPage />)

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByText('Delete Recipient?')).toBeInTheDocument()
  })

  it('pre-fills form when edit button is clicked', async () => {
    const recipient = createMockPaymentRecipient()
    jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
      data: [recipient],
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.useUpdatePaymentRecipient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<PaymentRecipientsPage />)

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByDisplayValue(recipient.recipient_name)).toBeInTheDocument()
    expect(screen.getByDisplayValue(recipient.account_number)).toBeInTheDocument()
    expect(screen.getByText(/edit recipient/i)).toBeInTheDocument()
  })
})
