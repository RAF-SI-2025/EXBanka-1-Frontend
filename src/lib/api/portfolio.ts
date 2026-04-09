import { apiClient } from '@/lib/api/axios'
import type {
  HoldingListResponse,
  PortfolioSummary,
  PortfolioFilters,
  Holding,
  MakePublicPayload,
} from '@/types/portfolio'

export async function getPortfolio(filters: PortfolioFilters = {}): Promise<HoldingListResponse> {
  const { data } = await apiClient.get<HoldingListResponse>('/api/v1/me/portfolio', {
    params: filters,
  })
  return { ...data, holdings: data.holdings ?? [] }
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await apiClient.get<PortfolioSummary>('/api/v1/me/portfolio/summary')
  return data
}

export async function makeHoldingPublic(id: number, payload: MakePublicPayload): Promise<Holding> {
  const { data } = await apiClient.post<Holding>(`/api/v1/me/portfolio/${id}/make-public`, payload)
  return data
}

export async function exerciseOption(id: number): Promise<Holding> {
  const { data } = await apiClient.post<Holding>(`/api/v1/me/portfolio/${id}/exercise`)
  return data
}
