import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectIsAuthenticated, selectHasPermission } from '@/store/selectors/authSelectors'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: string
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const hasPermission = useAppSelector((state) =>
    requiredPermission ? selectHasPermission(state, requiredPermission) : true
  )

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasPermission) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
