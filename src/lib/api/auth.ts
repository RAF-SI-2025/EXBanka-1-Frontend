import { apiClient } from '@/lib/api/axios'
import type {
  LoginRequest,
  AuthTokens,
  PasswordResetPayload,
  AccountActivationPayload,
} from '@/types/auth'

export async function login(credentials: LoginRequest): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/login', credentials)
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refresh_token: refreshToken })
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/auth/password/reset-request', { email })
}

export async function resetPassword(payload: PasswordResetPayload): Promise<void> {
  await apiClient.post('/auth/password/reset', payload)
}

export async function activateAccount(payload: AccountActivationPayload): Promise<void> {
  await apiClient.post('/auth/activate', payload)
}
