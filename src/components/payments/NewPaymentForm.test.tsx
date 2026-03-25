import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { NewPaymentForm } from '@/components/payments/NewPaymentForm'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockPaymentRecipient } from '@/__tests__/fixtures/payment-fixtures'

const mockAccounts = [createMockAccount()]
const mockRecipients = [createMockPaymentRecipient()]
const onSubmit = jest.fn()

describe('NewPaymentForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders form title', () => {
    renderWithProviders(
      <NewPaymentForm accounts={mockAccounts} recipients={mockRecipients} onSubmit={onSubmit} />
    )
    expect(screen.getByText('New Payment')).toBeInTheDocument()
  })

  it('renders receiver name input', () => {
    renderWithProviders(
      <NewPaymentForm accounts={mockAccounts} recipients={mockRecipients} onSubmit={onSubmit} />
    )
    expect(screen.getByLabelText(/recipient name/i)).toBeInTheDocument()
  })

  it('renders amount input', () => {
    renderWithProviders(
      <NewPaymentForm accounts={mockAccounts} recipients={mockRecipients} onSubmit={onSubmit} />
    )
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })

  it('renders submit/continue button', () => {
    renderWithProviders(
      <NewPaymentForm accounts={mockAccounts} recipients={mockRecipients} onSubmit={onSubmit} />
    )
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('renders "Payment Purpose" label for description field', () => {
    renderWithProviders(
      <NewPaymentForm accounts={mockAccounts} recipients={mockRecipients} onSubmit={onSubmit} />
    )
    expect(screen.getByText(/payment purpose/i)).toBeInTheDocument()
  })
})
