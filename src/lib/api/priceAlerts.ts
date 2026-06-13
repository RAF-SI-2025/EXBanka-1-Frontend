import { apiClient } from '@/lib/api/axios'
import type {
  CreatePriceAlertPayload,
  PriceAlert,
  PriceAlertListResponse,
  PriceAlertResponse,
  UpdatePriceAlertPayload,
} from '@/types/priceAlert'

export async function getMyPriceAlerts(): Promise<PriceAlert[]> {
  const { data } = await apiClient.get<PriceAlertListResponse>('/me/price-alerts')
  return data.alerts ?? []
}

export async function createPriceAlert(payload: CreatePriceAlertPayload): Promise<PriceAlert> {
  const { data } = await apiClient.post<PriceAlertResponse>('/me/price-alerts', payload)
  return data.alert
}

export async function updatePriceAlert(
  id: number,
  payload: UpdatePriceAlertPayload
): Promise<PriceAlert> {
  const { data } = await apiClient.put<PriceAlertResponse>(`/me/price-alerts/${id}`, payload)
  return data.alert
}

export async function deletePriceAlert(id: number): Promise<void> {
  await apiClient.delete(`/me/price-alerts/${id}`)
}
