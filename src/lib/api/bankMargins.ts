import { apiClient } from '@/lib/api/axios'
import type { BankMargin } from '@/types/bankMargins'

export async function getBankMargins(): Promise<{ margins: BankMargin[] }> {
  const { data } = await apiClient.get<{ margins: BankMargin[] }>('/api/bank-margins')
  return data
}

export async function updateBankMargin(id: number, margin: number): Promise<BankMargin> {
  const { data } = await apiClient.put<BankMargin>(`/api/bank-margins/${id}`, { margin })
  return data
}
