import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppSelector'
import {
  selectIsAuthenticated,
  selectHasPermission,
  selectUserType,
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
  const userType = useAppSelector(selectUserType)

  const hasPermission = useAppSelector((state) =>
    requiredPermission ? selectHasPermission(state, requiredPermission) : true
  )

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    if (requiredRole === 'Client' && userType !== 'client') return <Navigate to="/" replace />
    if (requiredRole === 'Employee' && userType !== 'employee') return <Navigate to="/" replace />
  }

  if (!hasPermission) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
