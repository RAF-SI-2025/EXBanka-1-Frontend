import { apiClient } from '@/lib/api/axios'
import type {
  Employee,
  EmployeeListResponse,
  EmployeeFilters,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@/types/employee'

export async function getEmployees(filters: EmployeeFilters = {}): Promise<EmployeeListResponse> {
  const { data } = await apiClient.get<EmployeeListResponse>('/api/v1/employees', {
    params: filters,
  })
  return data
}

export async function getEmployee(id: number): Promise<Employee> {
  const { data } = await apiClient.get<Employee>(`/api/v1/employees/${id}`)
  return data
}

export async function createEmployee(payload: CreateEmployeeRequest): Promise<Employee> {
  const { data } = await apiClient.post<Employee>('/api/v1/employees', payload)
  return data
}

export async function updateEmployee(
  id: number,
  payload: UpdateEmployeeRequest
): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/api/v1/employees/${id}`, payload)
  return data
}
