import { render, screen } from '@testing-library/react'
import { ActuaryPerformanceTable } from './ActuaryPerformanceTable'
import { createMockActuaryPerformance } from '@/__tests__/fixtures/profit-fixtures'

describe('ActuaryPerformanceTable', () => {
  it('shows empty state when no rows', () => {
    render(<ActuaryPerformanceTable actuaries={[]} />)
    expect(screen.getByText(/no actuary trades/i)).toBeInTheDocument()
  })

  it('renders rows sorted by realised_profit_rsd desc', () => {
    render(
      <ActuaryPerformanceTable
        actuaries={[
          createMockActuaryPerformance({ employee_id: 1, realised_profit_rsd: '100.00' }),
          createMockActuaryPerformance({ employee_id: 2, realised_profit_rsd: '500.00' }),
        ]}
      />
    )
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows[0]).toHaveTextContent('500.00')
    expect(rows[1]).toHaveTextContent('100.00')
  })
})
