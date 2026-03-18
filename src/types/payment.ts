export type PaymentStatus = 'REALIZED' | 'REJECTED' | 'PROCESSING'

export interface Payment {
  id: number
  order_number: string
  from_account: string
  to_account: string
  receiver_name: string
  amount: number
  currency: string
  payment_code: string
  reference?: string
  description?: string
  status: PaymentStatus
  timestamp: string
}

export interface PaymentListResponse {
  payments: Payment[]
  total_count: number
}

export interface PaymentFilters {
  account_number?: string
  from_date?: string
  to_date?: string
  status?: PaymentStatus
  page?: number
  page_size?: number
}

export interface CreatePaymentRequest {
  from_account: string
  to_account: string
  receiver_name: string
  amount: number
  payment_code: string
  reference?: string
  description?: string
}

export interface CreateInternalTransferRequest {
  from_account: string
  to_account: string
  amount: number
  description?: string
}

export interface PaymentRecipient {
  id: number
  name: string
  account_number: string
  reference?: string
  payment_code?: string
}

export interface CreatePaymentRecipientRequest {
  name: string
  account_number: string
  reference?: string
  payment_code?: string
}
