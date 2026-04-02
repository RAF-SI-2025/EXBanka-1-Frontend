export interface TaxRecord {
  id: number
  user_type: 'client' | 'actuary'
  user_name: string
  user_email: string
  taxable_amount: string
  tax_amount: string
  status: string
  created_at: string
}

export interface TaxListResponse {
  tax_records: TaxRecord[]
  total_count: number
}

export interface TaxFilters {
  page?: number
  page_size?: number
  user_type?: 'client' | 'actuary'
  search?: string
}

export interface CollectTaxResponse {
  collected_count: number
  total_collected_rsd: string
  failed_count: number
}
