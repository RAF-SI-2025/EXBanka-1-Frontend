import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'
import { FundDetailsPanel } from '../components/FundDetailsPanel'
import { createMockFundDetailResponse, createMockFund } from '@/__tests__/fixtures/fund-fixtures'

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

describe('FundDetailsPanel', () => {
  beforeEach(() => {
    mockUseEmployee.mockClear()
  })

  it('renders the secondary fund-detail metrics (headline stats live in the hero cards)', () => {
    const detail = createMockFundDetailResponse({
      fund: createMockFund({ name: 'Nova torbica', minimum_contribution_rsd: '100' }),
      liquid_rsd_balance: '100921.73',
      total_holdings_value_rsd: '0.00',
      total_dividends_paid_rsd: '0.00',
    })
    renderWithProviders(<FundDetailsPanel detail={detail} />, {
      preloadedState: { auth: adminAuth },
    })

    expect(screen.getByText(/Holdings value/i)).toBeInTheDocument()
    expect(screen.getByText(/Liquid cash/i)).toBeInTheDocument()
    expect(screen.getByText(/Dividends paid/i)).toBeInTheDocument()
    expect(screen.getByText(/Min\. contribution/i)).toBeInTheDocument()
    expect(screen.getByText(/Manager/i)).toBeInTheDocument()
    expect(screen.getByText(/Account #/i)).toBeInTheDocument()
    // Headline stats (Total value / Profit / Total contributed / Investors) are
    // shown by FundSummaryCards, not this panel.
    expect(screen.queryByText(/Total value/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Total contributed/i)).not.toBeInTheDocument()
  })

  it('renders "— RSD" instead of "undefined RSD" when a numeric field is null/empty', () => {
    const detail = createMockFundDetailResponse({
      fund: createMockFund({ minimum_contribution_rsd: null }),
      liquid_rsd_balance: '',
      total_value_rsd: '',
      profit_rsd: '',
      profit_pct: '',
      total_dividends_paid_rsd: '',
      total_contributed_rsd: '',
      total_holdings_value_rsd: '',
    })
    renderWithProviders(<FundDetailsPanel detail={detail} />, {
      preloadedState: { auth: adminAuth },
    })
    expect(screen.queryByText(/undefined rsd/i)).not.toBeInTheDocument()
    expect(screen.getAllByText(/—\s*RSD/i).length).toBeGreaterThanOrEqual(1)
  })

  it('calls useEmployee with suppressGlobalError: true to silence permission errors for non-admin roles', () => {
    renderWithProviders(<FundDetailsPanel detail={createMockFundDetailResponse()} />, {
      preloadedState: { auth: adminAuth },
    })
    expect(mockUseEmployee).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ suppressGlobalError: true })
    )
  })

  it('enables useEmployee when user has employees.read permission (admin)', () => {
    renderWithProviders(<FundDetailsPanel detail={createMockFundDetailResponse()} />, {
      preloadedState: { auth: adminAuth },
    })
    expect(mockUseEmployee).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ enabled: true })
    )
  })

  it('does not call useEmployee when employee lacks employees.read permission (e.g. supervisor/agent)', () => {
    renderWithProviders(<FundDetailsPanel detail={createMockFundDetailResponse()} />, {
      preloadedState: { auth: employeeWithoutPermissionAuth },
    })
    expect(mockUseEmployee).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ enabled: false })
    )
  })

  it('does not call useEmployee when user is a client', () => {
    renderWithProviders(<FundDetailsPanel detail={createMockFundDetailResponse()} />, {
      preloadedState: { auth: clientAuth },
    })
    expect(mockUseEmployee).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ enabled: false })
    )
  })
})
