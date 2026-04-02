import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransferHistoryTable } from '@/components/transfers/TransferHistoryTable'
import { createMockTransfer } from '@/__tests__/fixtures/transfer-fixtures'

describe('TransferHistoryTable', () => {
  it('renders transfer rows', () => {
    const transfers = [
      createMockTransfer({ id: 1, initial_amount: 1300 }),
      createMockTransfer({ id: 2, initial_amount: 500 }),
    ]
    renderWithProviders(<TransferHistoryTable transfers={transfers} />)
    expect(screen.getByText(/1.300/)).toBeInTheDocument()
  })

  it('shows empty state', () => {
    renderWithProviders(<TransferHistoryTable transfers={[]} />)
    expect(screen.getByText(/no transfers/i)).toBeInTheDocument()
  })

  it('displays commission column header', () => {
    renderWithProviders(<TransferHistoryTable transfers={[createMockTransfer()]} />)
    expect(screen.getByText('Commission')).toBeInTheDocument()
  })

  it('displays formatted commission value', () => {
    const transfer = createMockTransfer({ commission: 0.7 })
    renderWithProviders(<TransferHistoryTable transfers={[transfer]} />)
    expect(screen.getByText('0.70')).toBeInTheDocument()
  })
})
