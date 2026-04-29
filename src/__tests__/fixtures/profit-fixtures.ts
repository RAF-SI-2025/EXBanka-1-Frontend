import type { ActuaryPerformance, BankFundPosition } from '@/types/profit'

export function createMockActuaryPerformance(
  overrides: Partial<ActuaryPerformance> = {}
): ActuaryPerformance {
  return {
    employee_id: 25,
    first_name: 'Marija',
    last_name: 'Marković',
    position: 'supervisor',
    realised_profit_rsd: '125000.00',
    trade_count: 42,
    ...overrides,
  }
}

export function createMockBankFundPosition(
  overrides: Partial<BankFundPosition> = {}
): BankFundPosition {
  return {
    fund_id: 101,
    fund_name: 'Alpha Growth Fund',
    manager_employee_id: 25,
    total_contributed_rsd: '500000.00',
    current_value_rsd: '540000.00',
    percentage_fund: '20.0',
    profit_rsd: '40000.00',
    ...overrides,
  }
}
