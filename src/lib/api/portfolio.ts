import { apiClient } from '@/lib/api/axios'
import type {
  HoldingListResponse,
  PortfolioSummary,
  PortfolioFilters,
  Holding,
  MakePublicPayload,
} from '@/types/portfolio'

export async function getPortfolio(filters: PortfolioFilters = {}): Promise<HoldingListResponse> {
  const { data } = await apiClient.get<HoldingListResponse>('/api/me/portfolio', {
    params: filters,
  })
  return data
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await apiClient.get<PortfolioSummary>('/api/me/portfolio/summary')
  return data
}

export async function makeHoldingPublic(id: number, payload: MakePublicPayload): Promise<Holding> {
  const { data } = await apiClient.post<Holding>(`/api/me/portfolio/${id}/make-public`, payload)
  return data
}

export async function exerciseOption(id: number): Promise<Holding> {
  const { data } = await apiClient.post<Holding>(`/api/me/portfolio/${id}/exercise`)
  return data
}
