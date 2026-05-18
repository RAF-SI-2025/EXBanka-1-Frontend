import { apiClient } from '@/lib/api/axios'
import type { CollectTaxResponse, TaxFilters, TaxListResponse } from '@/views/tax/types'

export const taxApi = {
  async list(filters: TaxFilters = {}): Promise<TaxListResponse> {
    const { data } = await apiClient.get<TaxListResponse>('/tax', { params: filters })
    return { ...data, tax_records: data.tax_records ?? [] }
  },
  async collect(): Promise<CollectTaxResponse> {
    const { data } = await apiClient.post<CollectTaxResponse>('/tax/collect')
    return data
  },
}
