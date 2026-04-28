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
  const { data } = await apiClient.get<EmployeeLimits>(`/employees/${id}/limits`)
  return data
}

export async function updateEmployeeLimits(
  id: number,
  payload: UpdateEmployeeLimitsPayload
): Promise<EmployeeLimits> {
  const { data } = await apiClient.put<EmployeeLimits>(`/employees/${id}/limits`, payload)
  return data
}

export async function applyLimitTemplate(
  employeeId: number,
  templateName: string
): Promise<EmployeeLimits> {
  const { data } = await apiClient.post<EmployeeLimits>(
    `/employees/${employeeId}/limits/template`,
    { template_name: templateName }
  )
  return data
}

export async function getLimitTemplates(): Promise<LimitTemplateListResponse> {
  const { data } = await apiClient.get<LimitTemplateListResponse>('/limits/templates')
  return { ...data, templates: data.templates ?? [] }
}

export async function createLimitTemplate(
  payload: CreateLimitTemplatePayload
): Promise<LimitTemplate> {
  const { data } = await apiClient.post<LimitTemplate>('/limits/templates', payload)
  return data
}

export async function getClientLimits(id: number): Promise<ClientLimits> {
  const { data } = await apiClient.get<ClientLimits>(`/clients/${id}/limits`)
  return data
}

export async function updateClientLimits(
  id: number,
  payload: UpdateClientLimitsPayload
): Promise<ClientLimits> {
  const { data } = await apiClient.put<ClientLimits>(`/clients/${id}/limits`, payload)
  return data
}
