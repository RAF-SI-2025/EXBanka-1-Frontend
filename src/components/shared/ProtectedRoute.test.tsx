import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

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
})
