export type TransferStatus = 'REALIZED' | 'REJECTED' | 'PROCESSING'

export interface Transfer {
  id: number
  order_number: string
  from_account: string
  to_account: string
  initial_amount: number
  initial_currency: string
  final_amount: number
  final_currency: string
  exchange_rate: number
  commission: number
  timestamp: string
  status: TransferStatus
}

export interface TransferListResponse {
  transfers: Transfer[]
  total_count: number
}

export interface TransferFilters {
  from_date?: string
  to_date?: string
  page?: number
  page_size?: number
}

export interface CreateTransferRequest {
  from_account: string
  to_account: string
  amount: number
}

export interface ExchangeRateResult {
  from_currency: string
  to_currency: string
  rate: number
  commission?: number
  to_amount?: number
}
