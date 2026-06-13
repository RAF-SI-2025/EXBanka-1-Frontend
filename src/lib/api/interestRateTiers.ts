import { apiClient } from '@/lib/api/axios'
import type { InterestRateTier, CreateTierPayload } from '@/types/interestRateTiers'

export interface TierListResponse {
  tiers: InterestRateTier[]
}

export interface ApplyTierResponse {
  affected_loans: number
}

export async function getInterestRateTiers(): Promise<TierListResponse> {
  const { data } = await apiClient.get<TierListResponse>('/interest-rate-tiers')
  return { ...data, tiers: data.tiers ?? [] }
}

export async function createTier(payload: CreateTierPayload): Promise<InterestRateTier> {
  const { data } = await apiClient.post<InterestRateTier>('/interest-rate-tiers', payload)
  return data
}

export async function updateTier(
  id: number,
  payload: CreateTierPayload
): Promise<InterestRateTier> {
  const { data } = await apiClient.put<InterestRateTier>(`/interest-rate-tiers/${id}`, payload)
  return data
}

export async function deleteTier(id: number): Promise<void> {
  await apiClient.delete(`/interest-rate-tiers/${id}`)
}

export async function applyTier(id: number): Promise<ApplyTierResponse> {
  const { data } = await apiClient.post<ApplyTierResponse>(`/interest-rate-tiers/${id}/apply`)
  return data
}
