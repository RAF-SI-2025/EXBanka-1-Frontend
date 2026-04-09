import { apiClient } from '@/lib/api/axios'
import type { Permission } from '@/types/roles'
import type { Employee } from '@/types/employee'

export interface PermissionListResponse {
  permissions: Permission[]
}

export async function getPermissions(): Promise<PermissionListResponse> {
  const { data } = await apiClient.get<PermissionListResponse>('/api/v1/permissions')
  return { ...data, permissions: data.permissions ?? [] }
}

export async function setEmployeeRoles(id: number, roleNames: string[]): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/api/v1/employees/${id}/roles`, {
    role_names: roleNames,
  })
  return data
}

export async function setEmployeePermissions(
  id: number,
  permissionCodes: string[]
): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/api/v1/employees/${id}/permissions`, {
    permission_codes: permissionCodes,
  })
  return data
}
