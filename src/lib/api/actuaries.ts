import { apiClient } from '@/lib/api/axios'
import type {
  Actuary,
  ActuaryListResponse,
  ActuaryFilters,
  SetLimitPayload,
  SetApprovalPayload,
} from '@/types/actuary'

export async function getActuaries(filters: ActuaryFilters = {}): Promise<ActuaryListResponse> {
  const { data } = await apiClient.get<ActuaryListResponse>('/api/actuaries', {
    params: filters,
  })
  return data
}

export async function setActuaryLimit(id: number, payload: SetLimitPayload): Promise<Actuary> {
  const { data } = await apiClient.put<Actuary>(`/api/actuaries/${id}/limit`, payload)
  return data
}

export async function resetActuaryLimit(id: number): Promise<Actuary> {
  const { data } = await apiClient.post<Actuary>(`/api/actuaries/${id}/reset-limit`)
  return data
}

export async function setActuaryApproval(
  id: number,
  payload: SetApprovalPayload
): Promise<Actuary> {
  const { data } = await apiClient.put<Actuary>(`/api/actuaries/${id}/approval`, payload)
  return data
}
