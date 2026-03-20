import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { clientLoginThunk } from '@/store/slices/authSlice'
import { selectUserType } from '@/store/selectors/authSelectors'
import type { LoginRequest } from '@/types/auth'

export function ClientLoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const userType = useAppSelector(selectUserType)
  const { status, error } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (userType === 'client') {
      navigate('/home', { replace: true })
    }
  }, [userType, navigate])

  const handleSubmit = (data: LoginRequest) => {
    dispatch(clientLoginThunk(data))
  }

  return <LoginForm onSubmit={handleSubmit} isLoading={status === 'loading'} error={error} />
}
