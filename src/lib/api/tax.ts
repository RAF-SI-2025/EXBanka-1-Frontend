import { apiClient } from '@/lib/api/axios'
import type { TaxListResponse, TaxFilters, CollectTaxResponse } from '@/types/tax'

export async function getTaxRecords(filters: TaxFilters = {}): Promise<TaxListResponse> {
  const { data } = await apiClient.get<TaxListResponse>('/api/tax', { params: filters })
  return data
}

export async function collectTaxes(): Promise<CollectTaxResponse> {
  const { data } = await apiClient.post<CollectTaxResponse>('/api/tax/collect')
  return data
}
