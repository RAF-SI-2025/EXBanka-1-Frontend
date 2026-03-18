import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppSelector'
import {
  selectIsAuthenticated,
  selectHasPermission,
  selectCurrentUser,
} from '@/store/selectors/authSelectors'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: string
  requiredRole?: 'Client' | 'Employee'
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)

  const hasPermission = useAppSelector((state) =>
    requiredPermission ? selectHasPermission(state, requiredPermission) : true
  )

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const isClient = user?.role === 'Client'
    const isEmployee = !isClient
    if (requiredRole === 'Client' && !isClient) return <Navigate to="/" replace />
    if (requiredRole === 'Employee' && !isEmployee) return <Navigate to="/" replace />
  }

  if (!hasPermission) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
