import { apiClient } from '@/lib/api/axios'
import type { ActuaryPerformanceResponse, BankFundPositionsResponse } from '@/types/profit'

export async function getActuaryPerformance(): Promise<ActuaryPerformanceResponse> {
  const { data } = await apiClient.get<ActuaryPerformanceResponse>('/actuaries/performance')
  return { actuaries: data.actuaries ?? [] }
}

export async function getBankFundPositions(): Promise<BankFundPositionsResponse> {
  const { data } = await apiClient.get<BankFundPositionsResponse>('/investment-funds/positions')
  return { positions: data.positions ?? [] }
}
