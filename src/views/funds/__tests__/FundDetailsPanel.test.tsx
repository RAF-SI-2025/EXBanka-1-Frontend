import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'
import { FundDetailsPanel } from '../components/FundDetailsPanel'
import type { Fund } from '@/types/fund'

const mockUseEmployee = jest.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_id: number, _options?: { suppressGlobalError?: boolean; enabled?: boolean }) => ({
    data: undefined,
  })
)

jest.mock('@/hooks/useEmployee', () => ({
  useEmployee: (id: number, options?: { suppressGlobalError?: boolean; enabled?: boolean }) =>
    mockUseEmployee(id, options),
}))

const adminAuth = createMockAuthState({
  user: createMockAuthUser({ role: 'EmployeeAdmin', permissions: [] }),
})

const employeeWithoutPermissionAuth = createMockAuthState({
  user: createMockAuthUser({ role: 'EmployeeSupervisor', permissions: [] }),
})

const clientAuth = createMockAuthState({
  user: createMockAuthUser({
    role: 'Client',
    permissions: [],
    system_type: 'client',
  }),
  userType: 'client',
})

// Build a fund with null RSD fields (backend can omit these)
const baseFund: Fund = {
  id: 1,
  name: 'Test Fund',
  description: 'A test fund',
  minimum_contribution_rsd: null,
  manager_employee_id: 5,
  rsd_account_id: 10,
  fund_value_rsd: null,
  liquid_cash_rsd: null,
  profit_rsd: null,
  active: true,
  created_at: '2025-01-01',
}

describe('FundDetailsPanel', () => {
  beforeEach(() => {
    mockUseEmployee.mockClear()
  })

  it('shows "— RSD" instead of "undefined RSD" when RSD fields are null', () => {
    renderWithProviders(<FundDetailsPanel fund={baseFund} />, {
      preloadedState: { auth: adminAuth },
    })
    expect(screen.queryByText(/undefined rsd/i)).not.toBeInTheDocument()
    expect(screen.getAllByText(/— rsd/i)).toHaveLength(4)
  })

  it('calls useEmployee with suppressGlobalError: true to silence permission errors for non-admin roles', () => {
    renderWithProviders(<FundDetailsPanel fund={baseFund} />, {
      preloadedState: { auth: adminAuth },
    })
    expect(mockUseEmployee).toHaveBeenCalledWith(
      baseFund.manager_employee_id,
      expect.objectContaining({ suppressGlobalError: true })
    )
  })

  it('enables useEmployee when user has employees.read permission (admin)', () => {
    renderWithProviders(<FundDetailsPanel fund={baseFund} />, {
      preloadedState: { auth: adminAuth },
    })
    expect(mockUseEmployee).toHaveBeenCalledWith(
      baseFund.manager_employee_id,
      expect.objectContaining({ enabled: true })
    )
  })

  it('does not call useEmployee when employee lacks employees.read permission (e.g. supervisor/agent)', () => {
    renderWithProviders(<FundDetailsPanel fund={baseFund} />, {
      preloadedState: { auth: employeeWithoutPermissionAuth },
    })
    expect(mockUseEmployee).toHaveBeenCalledWith(
      baseFund.manager_employee_id,
      expect.objectContaining({ enabled: false })
    )
  })

  it('does not call useEmployee when user is a client', () => {
    renderWithProviders(<FundDetailsPanel fund={baseFund} />, {
      preloadedState: { auth: clientAuth },
    })
    expect(mockUseEmployee).toHaveBeenCalledWith(
      baseFund.manager_employee_id,
      expect.objectContaining({ enabled: false })
    )
  })
})
