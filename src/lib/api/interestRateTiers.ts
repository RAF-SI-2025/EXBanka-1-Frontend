import { apiClient } from '@/lib/api/axios'
import type { InterestRateTier, CreateTierPayload } from '@/types/interestRateTiers'

export async function getInterestRateTiers(): Promise<{ tiers: InterestRateTier[] }> {
  const { data } = await apiClient.get<{ tiers: InterestRateTier[] }>('/api/interest-rate-tiers')
  return data
}

export async function createTier(payload: CreateTierPayload): Promise<InterestRateTier> {
  const { data } = await apiClient.post<InterestRateTier>('/api/interest-rate-tiers', payload)
  return data
}

export async function updateTier(
  id: number,
  payload: Partial<CreateTierPayload>
): Promise<InterestRateTier> {
  const { data } = await apiClient.put<InterestRateTier>(`/api/interest-rate-tiers/${id}`, payload)
  return data
}

export async function deleteTier(id: number): Promise<void> {
  await apiClient.delete(`/api/interest-rate-tiers/${id}`)
}

export async function applyTier(id: number): Promise<unknown> {
  const { data } = await apiClient.post(`/api/interest-rate-tiers/${id}/apply`)
  return data
}
