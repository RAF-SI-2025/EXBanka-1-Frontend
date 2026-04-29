import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FundsTable } from './FundsTable'
import { createMockFund } from '@/__tests__/fixtures/fund-fixtures'

function renderTable(props: Partial<React.ComponentProps<typeof FundsTable>> = {}) {
  const defaults = { funds: [createMockFund()], onInvest: jest.fn() }
  const merged = { ...defaults, ...props }
  render(
    <MemoryRouter>
      <FundsTable {...merged} />
    </MemoryRouter>
  )
  return merged
}

describe('FundsTable', () => {
  it('renders fund name + description', () => {
    renderTable()
    expect(screen.getByText('Alpha Growth Fund')).toBeInTheDocument()
    expect(screen.getByText('IT-sector focus')).toBeInTheDocument()
  })

  it('shows empty state when no funds', () => {
    renderTable({ funds: [] })
    expect(screen.getByText(/no funds available/i)).toBeInTheDocument()
  })

  it('calls onInvest with the fund when Invest is clicked', () => {
    const fund = createMockFund({ id: 5, name: 'Test Fund' })
    const onInvest = jest.fn()
    renderTable({ funds: [fund], onInvest })
    fireEvent.click(screen.getByRole('button', { name: /invest/i }))
    expect(onInvest).toHaveBeenCalledWith(fund)
  })

  it('disables Invest for inactive funds', () => {
    renderTable({ funds: [createMockFund({ active: false })] })
    expect(screen.getByRole('button', { name: /invest/i })).toBeDisabled()
  })

  it('links the name to the detail route', () => {
    renderTable({ funds: [createMockFund({ id: 99, name: 'X Fund' })] })
    const link = screen.getByRole('link', { name: 'X Fund' })
    expect(link).toHaveAttribute('href', '/funds/99')
  })
})
