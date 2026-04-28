import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState() } }
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        preloadedState: {
          auth: createMockAuthState({ status: 'idle', user: null, accessToken: null }),
        },
      }
    )
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects when user lacks required permission', () => {
    renderWithProviders(
      <ProtectedRoute requiredPermission="nonexistent.permission">
        <div>Admin Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState() } }
    )
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('renders when user has required permission', () => {
    renderWithProviders(
      <ProtectedRoute requiredPermission="employees.read">
        <div>Admin Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState() } }
    )
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('renders client content when userType is client and requiredRole is Client', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="Client">
        <div>Client Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState({ userType: 'client' }) } }
    )
    expect(screen.getByText('Client Content')).toBeInTheDocument()
  })

  it('blocks client content when userType is employee and requiredRole is Client', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="Client">
        <div>Client Content</div>
      </ProtectedRoute>,
      { preloadedState: { auth: createMockAuthState({ userType: 'employee' }) } }
    )
    expect(screen.queryByText('Client Content')).not.toBeInTheDocument()
  })

  it('renders when requireAdmin and role is EmployeeAdmin', () => {
    renderWithProviders(
      <ProtectedRoute requireAdmin>
        <div>Admin Area</div>
      </ProtectedRoute>,
      {
        preloadedState: {
          auth: createMockAuthState({
            user: createMockAuthUser({ role: 'EmployeeAdmin' }),
          }),
        },
      }
    )
    expect(screen.getByText('Admin Area')).toBeInTheDocument()
  })

  it('blocks when requireAdmin and role is not EmployeeAdmin', () => {
    renderWithProviders(
      <ProtectedRoute requireAdmin>
        <div>Admin Area</div>
      </ProtectedRoute>,
      {
        preloadedState: {
          auth: createMockAuthState({
            user: createMockAuthUser({ role: 'EmployeeBasic' }),
          }),
        },
      }
    )
    expect(screen.queryByText('Admin Area')).not.toBeInTheDocument()
  })
})
