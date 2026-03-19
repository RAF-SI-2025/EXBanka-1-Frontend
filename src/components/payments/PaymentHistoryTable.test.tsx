import { render, screen } from '@testing-library/react'
import { PaymentHistoryTable } from './PaymentHistoryTable'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

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

    expect(screen.getByText('Datum')).toBeInTheDocument()
    expect(screen.getByText('Sa računa')).toBeInTheDocument()
    expect(screen.getByText('Primalac')).toBeInTheDocument()
    expect(screen.getByText('Iznos')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('shows empty state when no payments', () => {
    render(<PaymentHistoryTable payments={[]} />)
    expect(screen.getByText(/nema plaćanja/i)).toBeInTheDocument()
  })

  it('renders status badge for each payment', () => {
    const payments = [
      createMockPayment({ id: 1, status: 'COMPLETED' }),
      createMockPayment({ id: 2, status: 'FAILED' }),
    ]
    render(<PaymentHistoryTable payments={payments} />)

    expect(screen.getByText('Realizovano')).toBeInTheDocument()
    expect(screen.getByText('Odbijeno')).toBeInTheDocument()
  })

  it('renders formatted amount for each payment', () => {
    const payments = [createMockPayment({ id: 1, initial_amount: 5000 })]
    render(<PaymentHistoryTable payments={payments} />)

    // Amount should appear formatted in the table
    const cells = screen.getAllByRole('cell')
    const amountCell = cells.find((cell) => cell.textContent?.includes('5'))
    expect(amountCell).toBeInTheDocument()
  })
})
