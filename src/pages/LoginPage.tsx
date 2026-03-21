import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { loginThunk } from '@/store/slices/authSlice'
import { selectIsAuthenticated, selectCurrentUser } from '@/store/selectors/authSelectors'
import type { LoginRequest } from '@/types/auth'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const { status, error } = useAppSelector((state) => state.auth)

  if (isAuthenticated) {
    const isClient = user?.role?.toLowerCase() === 'client'
    return <Navigate to={isClient ? '/home' : '/admin/accounts'} replace />
  }

  const handleSubmit = (data: LoginRequest) => {
    dispatch(loginThunk(data))
  }

  return <LoginForm onSubmit={handleSubmit} isLoading={status === 'loading'} error={error} />
}
