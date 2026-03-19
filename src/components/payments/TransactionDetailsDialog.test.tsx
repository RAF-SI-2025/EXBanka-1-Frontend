import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransactionDetailsDialog } from '@/components/payments/TransactionDetailsDialog'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

jest.mock('@/lib/utils/receipt-pdf', () => ({
  generateReceiptPdf: jest.fn(),
}))

describe('TransactionDetailsDialog', () => {
  it('renders payment details when open', () => {
    const payment = createMockPayment()
    renderWithProviders(
      <TransactionDetailsDialog payment={payment} open onOpenChange={jest.fn()} />
    )
    expect(screen.getByText(String(payment.id))).toBeInTheDocument()
    expect(screen.getByText(payment.recipient_name)).toBeInTheDocument()
  })

  it('renders nothing when payment is null', () => {
    renderWithProviders(
      <TransactionDetailsDialog payment={null} open={false} onOpenChange={jest.fn()} />
    )
    expect(screen.queryByText(/detalji/i)).not.toBeInTheDocument()
  })

  it('renders PDF download button', () => {
    const payment = createMockPayment()
    renderWithProviders(
      <TransactionDetailsDialog payment={payment} open onOpenChange={jest.fn()} />
    )
    expect(screen.getByRole('button', { name: /štampaj potvrdu/i })).toBeInTheDocument()
  })
})
