import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { loginThunk } from '@/store/slices/authSlice'
import { selectIsAuthenticated, selectUserType } from '@/store/selectors/authSelectors'
import type { LoginRequest } from '@/types/auth'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const userType = useAppSelector(selectUserType)
  const { status, error } = useAppSelector((state) => state.auth)

  if (isAuthenticated) {
    if (userType === 'client') {
      return <Navigate to="/home" replace />
    } else if (userType === 'employee') {
      return <Navigate to="/admin/accounts" replace />
    }
  }

  const handleSubmit = (data: LoginRequest) => {
    dispatch(loginThunk(data))
  }

  return <LoginForm onSubmit={handleSubmit} isLoading={status === 'loading'} error={error} />
}
