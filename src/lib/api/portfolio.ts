import { apiClient } from '@/lib/api/axios'
import type { PortfolioListResponse, PortfolioSummary, HoldingType } from '@/types/portfolio'

export async function getPortfolio(
  securityType?: HoldingType,
  page?: number,
  pageSize?: number
): Promise<PortfolioListResponse> {
  const params = new URLSearchParams()
  if (securityType) params.append('security_type', securityType)
  if (page) params.append('page', String(page))
  if (pageSize) params.append('page_size', String(pageSize))
  const response = await apiClient.get<PortfolioListResponse>('/api/me/portfolio', { params })
  return response.data
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const response = await apiClient.get<PortfolioSummary>('/api/me/portfolio/summary')
  return response.data
}

export async function makePublicHolding(id: number, quantity: number): Promise<void> {
  await apiClient.post(`/api/me/portfolio/${id}/make-public`, { quantity })
}

export async function exerciseOption(id: number): Promise<void> {
  await apiClient.post(`/api/me/portfolio/${id}/exercise`)
}
