import { apiClient } from '@/lib/api/axios'
import type { TaxListResponse, TaxFilters, CollectTaxResponse } from '@/types/tax'

export async function getTaxRecords(filters: TaxFilters = {}): Promise<TaxListResponse> {
  const { data } = await apiClient.get<TaxListResponse>('/api/v1/tax', { params: filters })
  return { ...data, tax_records: data.tax_records ?? [] }
}

export async function collectTaxes(): Promise<CollectTaxResponse> {
  const { data } = await apiClient.post<CollectTaxResponse>('/api/v1/tax/collect')
  return data
}
