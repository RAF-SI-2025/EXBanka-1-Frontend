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
    const rawRole = typeof decoded.role === 'string' ? decoded.role : ''
    return {
      id: decoded.user_id,
      email: decoded.email,
      role: rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1) : rawRole,
      permissions: decoded.permissions ?? [],
    }
  } catch {
    return null
  }
}
