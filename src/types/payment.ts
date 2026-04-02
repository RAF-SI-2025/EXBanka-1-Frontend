export type PaymentStatus = string

export interface Payment {
  id: number
  from_account_number: string
  to_account_number: string
  initial_amount: number
  final_amount: number
  commission: number
  recipient_name: string
  payment_code: string
  reference_number?: string
  payment_purpose?: string
  status: PaymentStatus
  timestamp: string
}

export interface PaymentListResponse {
  payments: Payment[]
  total: number
}

export interface PaymentFilters {
  date_from?: string
  date_to?: string
  status_filter?: string
  amount_min?: number
  amount_max?: number
  page?: number
  page_size?: number
}

export interface CreatePaymentRequest {
  from_account_number: string
  to_account_number: string
  recipient_name: string
  amount: number
  payment_code: string
  reference_number?: string
  payment_purpose?: string
}

export interface CreateInternalTransferRequest {
  from_account_number: string
  to_account_number: string
  amount: number
  description?: string
}

export interface PaymentRecipient {
  id: number
  client_id: number
  recipient_name: string
  account_number: string
  created_at: string
}

export interface CreatePaymentRecipientRequest {
  client_id: number
  recipient_name: string
  account_number: string
}
