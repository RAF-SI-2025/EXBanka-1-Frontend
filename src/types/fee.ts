export interface TransferFee {
  id: number
  name: string
  fee_type: 'percentage' | 'fixed'
  fee_value: string
  min_amount: string
  max_fee: string
  transaction_type: 'payment' | 'transfer' | 'all'
  currency_code: string
  active: boolean
}

export interface FeeListResponse {
  fees: TransferFee[]
}

export interface CreateFeePayload {
  name: string
  fee_type: 'percentage' | 'fixed'
  fee_value: string
  min_amount?: string
  max_fee?: string
  transaction_type: 'payment' | 'transfer' | 'all'
  currency_code?: string
}

export interface UpdateFeePayload {
  name?: string
  fee_type?: 'percentage' | 'fixed'
  fee_value?: string
  min_amount?: string
  max_fee?: string
  transaction_type?: 'payment' | 'transfer' | 'all'
  currency_code?: string
  active?: boolean
}
