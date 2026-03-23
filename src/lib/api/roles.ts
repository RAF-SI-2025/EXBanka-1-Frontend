import { apiClient } from '@/lib/api/axios'
import type { Role, Permission, CreateRolePayload } from '@/types/roles'
import type { Employee } from '@/types/employee'

export async function getRoles(): Promise<{ roles: Role[] }> {
  const { data } = await apiClient.get<{ roles: Role[] }>('/api/roles')
  return data
}

export async function getRole(id: number): Promise<Role> {
  const { data } = await apiClient.get<Role>(`/api/roles/${id}`)
  return data
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data } = await apiClient.post<Role>('/api/roles', payload)
  return data
}

export async function updateRolePermissions(id: number, permissionCodes: string[]): Promise<Role> {
  const { data } = await apiClient.put<Role>(`/api/roles/${id}/permissions`, {
    permission_codes: permissionCodes,
  })
  return data
}

export async function getPermissions(): Promise<{ permissions: Permission[] }> {
  const { data } = await apiClient.get<{ permissions: Permission[] }>('/api/permissions')
  return data
}

export async function setEmployeeRoles(employeeId: number, roleNames: string[]): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/api/employees/${employeeId}/roles`, {
    role_names: roleNames,
  })
  return data
}

export async function setEmployeePermissions(
  employeeId: number,
  permissionCodes: string[]
): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/api/employees/${employeeId}/permissions`, {
    permission_codes: permissionCodes,
  })
  return data
}
