import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '@/types/auth'

interface JwtPayload {
  principal_id: number
  email: string
  roles?: string[]
  permissions: string[]
  principal_type?: 'employee' | 'client'
}

export function decodeAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const firstRole = Array.isArray(decoded.roles) ? (decoded.roles[0] ?? '') : ''
    return {
      id: decoded.principal_id,
      email: decoded.email,
      role: firstRole ? firstRole.charAt(0).toUpperCase() + firstRole.slice(1) : firstRole,
      permissions: decoded.permissions ?? [],
      system_type: decoded.principal_type ?? null,
    }
  } catch {
    return null
  }
}
