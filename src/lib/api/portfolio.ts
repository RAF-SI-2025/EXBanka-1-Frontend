import { apiClient } from '@/lib/api/axios'
import type {
  HoldingListResponse,
  PortfolioSummary,
  PortfolioFilters,
  Holding,
  MakePublicPayload,
  MakePublicResponse,
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

/**
 * Publish shares from a holding onto the OTC stock marketplace.
 *
 * Phase 8 renamed the underlying route. The old endpoint was:
 *   POST /api/v3/me/portfolio/:id/make-public  { quantity }
 *
 * It is now (spec § 47.1):
 *   POST /api/v3/me/otc/stocks  { direction: "sell", holding_id, quantity }
 *
 * The function signature is unchanged for callers — only the wire shape moved.
 */
export async function makeHoldingPublic(
  id: number,
  payload: MakePublicPayload
): Promise<MakePublicResponse> {
  const body: Record<string, unknown> = {
    direction: 'sell',
    holding_id: id,
    quantity: payload.quantity,
  }
  if (payload.price_per_unit !== undefined) {
    body.price_per_unit = payload.price_per_unit
  }
  const { data } = await apiClient.post<MakePublicResponse>('/me/otc/stocks', body)
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
