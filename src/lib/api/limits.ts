import { apiClient } from '@/lib/api/axios'
import type {
  EmployeeLimits,
  ClientLimits,
  LimitTemplate,
  LimitTemplateListResponse,
  UpdateEmployeeLimitsPayload,
  UpdateClientLimitsPayload,
  CreateLimitTemplatePayload,
} from '@/types/limits'

export async function getEmployeeLimits(id: number): Promise<EmployeeLimits> {
  const { data } = await apiClient.get<EmployeeLimits>(`/api/v1/employees/${id}/limits`)
  return data
}

export async function updateEmployeeLimits(
  id: number,
  payload: UpdateEmployeeLimitsPayload
): Promise<EmployeeLimits> {
  const { data } = await apiClient.put<EmployeeLimits>(`/api/v1/employees/${id}/limits`, payload)
  return data
}

export async function applyLimitTemplate(
  employeeId: number,
  templateName: string
): Promise<EmployeeLimits> {
  const { data } = await apiClient.post<EmployeeLimits>(
    `/api/v1/employees/${employeeId}/limits/template`,
    { template_name: templateName }
  )
  return data
}

export async function getLimitTemplates(): Promise<LimitTemplateListResponse> {
  const { data } = await apiClient.get<LimitTemplateListResponse>('/api/v1/limits/templates')
  return { ...data, templates: data.templates ?? [] }
}

export async function createLimitTemplate(
  payload: CreateLimitTemplatePayload
): Promise<LimitTemplate> {
  const { data } = await apiClient.post<LimitTemplate>('/api/v1/limits/templates', payload)
  return data
}

export async function getClientLimits(id: number): Promise<ClientLimits> {
  const { data } = await apiClient.get<ClientLimits>(`/api/v1/clients/${id}/limits`)
  return data
}

export async function updateClientLimits(
  id: number,
  payload: UpdateClientLimitsPayload
): Promise<ClientLimits> {
  const { data } = await apiClient.put<ClientLimits>(`/api/v1/clients/${id}/limits`, payload)
  return data
}
