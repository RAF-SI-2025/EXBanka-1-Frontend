export interface Transfer {
  id: number
  from_account_number: string
  to_account_number: string
  initial_amount: number
  final_amount: number
  exchange_rate: number
  commission: number
  timestamp: string
}

export interface TransferListResponse {
  transfers: Transfer[]
  total: number
}

export interface TransferFilters {
  page?: number
  page_size?: number
}

export interface CreateTransferRequest {
  from_account_number: string
  to_account_number: string
  amount: number
}

export interface ExchangeRateResult {
  from_currency: string
  to_currency: string
  rate: number
  commission?: number
  to_amount?: number
}

export interface TransferPreviewFee {
  name: string
  fee_type: string
  fee_value: string
  calculated_amount: string
}

export interface TransferPreviewResponse {
  from_currency: string
  to_currency: string
  input_amount: string
  total_fee: string
  fee_breakdown: TransferPreviewFee[]
  converted_amount: string
  exchange_rate: string
  exchange_commission_rate: string
}
