import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransferHistoryTable } from '@/components/transfers/TransferHistoryTable'
import { createMockTransfer } from '@/__tests__/fixtures/transfer-fixtures'

describe('TransferHistoryTable', () => {
  it('renders transfer rows', () => {
    const transfers = [
      createMockTransfer({ id: 1, initial_amount: 1300, initial_currency: 'RSD' }),
      createMockTransfer({ id: 2, initial_amount: 500, initial_currency: 'EUR' }),
    ]
    renderWithProviders(<TransferHistoryTable transfers={transfers} />)
    expect(screen.getByText(/1.300/)).toBeInTheDocument()
  })

  it('shows empty state', () => {
    renderWithProviders(<TransferHistoryTable transfers={[]} />)
    expect(screen.getByText(/nema transfera/i)).toBeInTheDocument()
  })
})
