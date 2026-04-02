import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '@/types/auth'

interface JwtPayload {
  user_id: number
  email: string
  role: string
  permissions: string[]
}

export function decodeAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
    }
  } catch {
    return null
  }
}
