import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentHistoryTable } from './PaymentHistoryTable'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

jest.mock('@/lib/utils/receipt-pdf', () => ({
  generateReceiptPdf: jest.fn(),
}))

describe('PaymentHistoryTable', () => {
  it('renders payment rows', () => {
    const payments = [
      createMockPayment({ id: 1, recipient_name: 'Elektro Beograd', initial_amount: 5000 }),
      createMockPayment({ id: 2, recipient_name: 'Vodovod', initial_amount: 1200 }),
    ]
    render(<PaymentHistoryTable payments={payments} />)

    expect(screen.getByText('Elektro Beograd')).toBeInTheDocument()
    expect(screen.getByText('Vodovod')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<PaymentHistoryTable payments={[]} />)

    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('From Account')).toBeInTheDocument()
    expect(screen.getByText('Recipient')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('shows empty state when no payments', () => {
    render(<PaymentHistoryTable payments={[]} />)
    expect(screen.getByText(/no payments/i)).toBeInTheDocument()
  })

  it('renders status badge for each payment', () => {
    const payments = [
      createMockPayment({ id: 1, status: 'COMPLETED' }),
      createMockPayment({ id: 2, status: 'FAILED' }),
    ]
    render(<PaymentHistoryTable payments={payments} />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('renders formatted amount for each payment', () => {
    const payments = [createMockPayment({ id: 1, initial_amount: 5000 })]
    render(<PaymentHistoryTable payments={payments} />)

    // Amount should appear formatted in the table
    const cells = screen.getAllByRole('cell')
    const amountCell = cells.find((cell) => cell.textContent?.includes('5'))
    expect(amountCell).toBeInTheDocument()
  })

  it('clicking PDF button does not open the transaction detail dialog', async () => {
    const user = userEvent.setup()
    const payment = createMockPayment()
    render(<PaymentHistoryTable payments={[payment]} />)

    const pdfButton = screen.getByText('PDF')
    await user.click(pdfButton)

    // The detail dialog should NOT be open
    expect(screen.queryByText('Transaction Details')).not.toBeInTheDocument()
  })
})
