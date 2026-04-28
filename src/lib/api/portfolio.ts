import { apiClient } from '@/lib/api/axios'
import type {
  HoldingListResponse,
  PortfolioSummary,
  PortfolioFilters,
  Holding,
  MakePublicPayload,
  HoldingTransactionsResponse,
  HoldingTransactionsFilters,
} from '@/types/portfolio'

export async function getPortfolio(filters: PortfolioFilters = {}): Promise<HoldingListResponse> {
  const { data } = await apiClient.get<HoldingListResponse>('/me/portfolio', {
    params: filters,
  })
  return { ...data, holdings: data.holdings ?? [] }
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await apiClient.get<PortfolioSummary>('/me/portfolio/summary')
  return data
}

export async function makeHoldingPublic(id: number, payload: MakePublicPayload): Promise<Holding> {
  const { data } = await apiClient.post<Holding>(`/me/portfolio/${id}/make-public`, payload)
  return data
}

export async function exerciseOption(id: number): Promise<Holding> {
  const { data } = await apiClient.post<Holding>(`/me/portfolio/${id}/exercise`)
  return data
}

export async function getHoldingTransactions(
  id: number,
  filters: HoldingTransactionsFilters = {}
): Promise<HoldingTransactionsResponse> {
  const { data } = await apiClient.get<HoldingTransactionsResponse>(
    `/me/holdings/${id}/transactions`,
    { params: filters }
  )
  return { ...data, transactions: data.transactions ?? [] }
}
