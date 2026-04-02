import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { loginThunk } from '@/store/slices/authSlice'
import { selectIsAuthenticated } from '@/store/selectors/authSelectors'
import type { LoginRequest } from '@/types/auth'
import peopleWalkingGif from '@/assets/people-walking.gif'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { status, error } = useAppSelector((state) => state.auth)

  if (isAuthenticated) {
    return <Navigate to="/employees" replace />
  }

  const handleSubmit = (data: LoginRequest) => {
    dispatch(loginThunk(data))
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${peopleWalkingGif})` }}
    >
      <div className="w-full max-w-md p-4">
        <LoginForm onSubmit={handleSubmit} isLoading={status === 'loading'} error={error} />
      </div>
    </div>
  )
}
