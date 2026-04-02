import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { RecentTransactions } from '@/components/accounts/RecentTransactions'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

describe('RecentTransactions', () => {
  it('renders transactions in a table', () => {
    const payments = [
      createMockPayment(),
      createMockPayment({ id: 2, recipient_name: 'Firma DOO' }),
    ]
    renderWithProviders(<RecentTransactions transactions={payments} />)
    expect(screen.getByText('Elektro Beograd')).toBeInTheDocument()
    expect(screen.getByText('Firma DOO')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', () => {
    renderWithProviders(<RecentTransactions transactions={[]} />)
    expect(screen.getByText(/no transactions/i)).toBeInTheDocument()
  })
})
