import { apiClient } from '@/lib/api/axios'
import type {
  PortfolioResponse,
  PortfolioSummary,
  SecurityPosition,
  HoldingTransactionsResponse,
  HoldingTransactionsFilters,
} from '@/types/portfolio'

const EMPTY_GROUP = { total_value_rsd: '0', total_profit_rsd: '0', total_profit_pct: '0' }

export async function getPortfolio(): Promise<PortfolioResponse> {
  const { data } = await apiClient.get<PortfolioResponse>('/me/portfolio')
  return {
    ...data,
    securities: {
      ...EMPTY_GROUP,
      ...(data.securities ?? {}),
      positions: data.securities?.positions ?? [],
    },
    funds: {
      ...EMPTY_GROUP,
      ...(data.funds ?? {}),
      positions: data.funds?.positions ?? [],
    },
  }
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await apiClient.get<PortfolioSummary>('/me/portfolio/summary')
  return data
}

export async function exerciseOption(holdingId: number): Promise<SecurityPosition> {
  const { data } = await apiClient.post<SecurityPosition>(`/me/portfolio/${holdingId}/exercise`)
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
