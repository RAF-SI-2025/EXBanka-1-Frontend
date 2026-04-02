import { apiClient } from '@/lib/api/axios'
import type { TaxListResponse, TaxFilters, TaxCollectResponse } from '@/types/tax'

export async function getTaxRecords(filters?: TaxFilters): Promise<TaxListResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  if (filters?.user_type) params.append('user_type', filters.user_type)
  if (filters?.search) params.append('search', filters.search)
  const response = await apiClient.get<TaxListResponse>('/api/tax', { params })
  return response.data
}

export async function collectTaxes(): Promise<TaxCollectResponse> {
  const response = await apiClient.post<TaxCollectResponse>('/api/tax/collect')
  return response.data
}
