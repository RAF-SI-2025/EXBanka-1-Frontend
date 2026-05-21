/**
 * Routing guard test for /admin/bank-accounts/:id/activity
 *
 * Bug #22 follow-up (final): The route is guarded by requiredRole="Employee",
 * so every employee role (admin, supervisor, agent) can navigate to the page.
 * If the backend rejects the call with 403 because the user lacks
 * `bank-accounts.manage`, BankAccountActivityView surfaces that inline as a
 * graceful EmptyState — there is no route-level redirect for permission denial.
 *
 * The second test below documents what would happen if the guard were
 * `requiredPermission="bank-accounts.manage"` instead. It still exercises
 * ProtectedRoute semantics and protects us from accidentally regressing the
 * guard option in the future.
 */
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { BankAccountActivityView } from '@/views/accounts/BankAccountActivityView'
import * as useAccountsHook from '@/hooks/useAccounts'

jest.mock('@/hooks/useAccounts')

const supervisorAuthState = {
  auth: {
    user: {
      id: 2,
      email: 'supervisor@test.com',
      role: 'EmployeeSupervisor',
      permissions: [] as string[],
      system_type: 'employee' as const,
    },
    userType: 'employee' as const,
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh',
    status: 'authenticated' as const,
    error: null,
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useAccountsHook.useBankAccountActivity).mockReturnValue({
    data: { entries: [], total_count: 0 },
    isLoading: false,
  } as any)
})

describe('BankAccountActivityRoute — access control', () => {
  it('supervisor (any employee) can access /admin/bank-accounts/:id/activity when guarded by requiredRole="Employee"', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="Employee">
        <BankAccountActivityView />
      </ProtectedRoute>,
      {
        preloadedState: supervisorAuthState,
        route: '/admin/bank-accounts/1/activity',
        routePath: '/admin/bank-accounts/:id/activity',
      }
    )
    expect(screen.getByText(/bank account activity/i)).toBeInTheDocument()
  })

  it('supervisor would be redirected if the guard required permission "bank-accounts.manage"', () => {
    renderWithProviders(
      <ProtectedRoute requiredPermission="bank-accounts.manage">
        <BankAccountActivityView />
      </ProtectedRoute>,
      {
        preloadedState: supervisorAuthState,
        route: '/admin/bank-accounts/1/activity',
        routePath: '/admin/bank-accounts/:id/activity',
      }
    )
    // Supervisor lacks bank-accounts.manage — view should NOT be rendered
    expect(screen.queryByText(/bank account activity/i)).not.toBeInTheDocument()
  })
})
