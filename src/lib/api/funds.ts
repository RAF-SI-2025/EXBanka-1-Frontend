import { apiClient } from '@/lib/api/axios'
import type {
  Fund,
  FundFilters,
  FundListResponse,
  FundDetailResponse,
  CreateFundPayload,
  UpdateFundPayload,
  InvestPayload,
  RedeemPayload,
  FundContribution,
  MyFundPositionsResponse,
} from '@/types/fund'

export async function getFunds(filters: FundFilters = {}): Promise<FundListResponse> {
  const { data } = await apiClient.get<FundListResponse>('/investment-funds', {
    params: filters,
  })
  return { ...data, funds: data.funds ?? [] }
}

export async function getFund(id: number): Promise<FundDetailResponse> {
  const { data } = await apiClient.get<FundDetailResponse>(`/investment-funds/${id}`)
  return {
    ...data,
    holdings: data.holdings ?? [],
    performance: data.performance ?? [],
  }
}

export async function createFund(payload: CreateFundPayload): Promise<{ fund: Fund }> {
  const { data } = await apiClient.post<{ fund: Fund }>('/investment-funds', payload)
  return data
}

export async function updateFund(id: number, payload: UpdateFundPayload): Promise<{ fund: Fund }> {
  const { data } = await apiClient.put<{ fund: Fund }>(`/investment-funds/${id}`, payload)
  return data
}

export async function investInFund(
  id: number,
  payload: InvestPayload
): Promise<{ contribution: FundContribution }> {
  const { data } = await apiClient.post<{ contribution: FundContribution }>(
    `/investment-funds/${id}/invest`,
    payload
  )
  return data
}

export async function redeemFromFund(
  id: number,
  payload: RedeemPayload
): Promise<{ contribution: FundContribution }> {
  const { data } = await apiClient.post<{ contribution: FundContribution }>(
    `/investment-funds/${id}/redeem`,
    payload
  )
  return data
}

export async function getMyFundPositions(): Promise<MyFundPositionsResponse> {
  const { data } = await apiClient.get<MyFundPositionsResponse>('/me/investment-funds')
  return { positions: data.positions ?? [] }
}
