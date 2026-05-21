import { render, screen } from '@testing-library/react'
import { FundDetailsPanel } from '../components/FundDetailsPanel'

jest.mock('@/hooks/useEmployee', () => ({
  useEmployee: () => ({ data: undefined }),
}))

// Build a fund with undefined RSD fields
const baseFund = {
  id: 1,
  name: 'Test Fund',
  description: 'A test fund',
  minimum_contribution_rsd: '1000',
  manager_employee_id: 5,
  rsd_account_id: 10,
  fund_value_rsd: undefined,
  liquid_cash_rsd: undefined,
  profit_rsd: undefined,
  active: true,
  created_at: '2025-01-01',
}

it('shows "— RSD" instead of "undefined RSD" when fund_value_rsd is undefined', () => {
  render(<FundDetailsPanel fund={baseFund as any} />)
  expect(screen.queryByText(/undefined rsd/i)).not.toBeInTheDocument()
})
