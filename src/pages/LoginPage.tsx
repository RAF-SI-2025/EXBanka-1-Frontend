import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { loginThunk } from '@/store/slices/authSlice'
import { selectIsAuthenticated, selectUserType } from '@/store/selectors/authSelectors'
import type { LoginRequest } from '@/types/auth'
import wrongPasswordSound from '@/assets/pogresna_sifra.m4a'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const userType = useAppSelector(selectUserType)
  const { status, error } = useAppSelector((state) => state.auth)
  const lastErrorRef = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'error' && error && error !== lastErrorRef.current) {
      lastErrorRef.current = error
      const audio = new Audio(wrongPasswordSound)
      audio.volume = 0.7
      audio.play().catch(() => {
        // Browsers may block autoplay if the user has not interacted yet —
        // ignore. The toast still surfaces the error.
      })
    }
    if (status !== 'error') {
      lastErrorRef.current = null
    }
  }, [status, error])

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
