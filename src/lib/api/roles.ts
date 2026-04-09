import { apiClient } from '@/lib/api/axios'
import type { Role, CreateRolePayload } from '@/types/roles'

export interface RoleListResponse {
  roles: Role[]
}

export async function getRoles(): Promise<RoleListResponse> {
  const { data } = await apiClient.get<RoleListResponse>('/api/v1/roles')
  return { ...data, roles: data.roles ?? [] }
}

export async function getRole(id: number): Promise<Role> {
  const { data } = await apiClient.get<Role>(`/api/v1/roles/${id}`)
  return data
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data } = await apiClient.post<Role>('/api/v1/roles', payload)
  return data
}

export async function updateRolePermissions(id: number, permissionCodes: string[]): Promise<Role> {
  const { data } = await apiClient.put<Role>(`/api/v1/roles/${id}/permissions`, {
    permission_codes: permissionCodes,
  })
  return data
}
