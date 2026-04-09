import { apiClient } from '@/lib/api/axios'
import type { BankMargin } from '@/types/bankMargins'

export interface MarginListResponse {
  margins: BankMargin[]
}

export async function getBankMargins(): Promise<MarginListResponse> {
  const { data } = await apiClient.get<MarginListResponse>('/api/v1/bank-margins')
  return { ...data, margins: data.margins ?? [] }
}

export async function updateBankMargin(id: number, margin: number): Promise<BankMargin> {
  const { data } = await apiClient.put<BankMargin>(`/api/v1/bank-margins/${id}`, { margin })
  return data
}
