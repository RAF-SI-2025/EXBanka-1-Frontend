import { apiClient } from '@/lib/api/axios'
import type {
  PortfolioResponse,
  PortfolioSummary,
  SecurityPosition,
  HoldingTransactionsResponse,
  HoldingTransactionsFilters,
} from '@/types/portfolio'

const EMPTY_GROUP = { total_value_rsd: '0', total_profit_rsd: '0', total_profit_pct: '0' }

// The backend ships `available_quantity` (the tradeable, un-reserved amount).
// The holdings table shows Available = that value and Reserved = quantity −
// available_quantity, so derive both here. When `available_quantity` is absent
// (or non-numeric) we can't compute the split, so leave `reserved`/`available`
// untouched and the table renders "-".
function normalizeSecurityPosition(p: SecurityPosition): SecurityPosition {
  if (p.available_quantity == null) return p
  const available = Number(p.available_quantity)
  if (Number.isNaN(available)) return p
  return { ...p, available: p.available_quantity, reserved: Number(p.quantity) - available }
}

export async function getPortfolio(): Promise<PortfolioResponse> {
  const { data } = await apiClient.get<PortfolioResponse>('/me/portfolio')
  return {
    ...data,
    securities: {
      ...EMPTY_GROUP,
      ...(data.securities ?? {}),
      positions: (data.securities?.positions ?? []).map(normalizeSecurityPosition),
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
  return normalizeSecurityPosition(data)
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
