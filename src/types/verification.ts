export interface GenerateVerificationRequest {
  client_id: number
  transaction_id: number
  transaction_type: 'PAYMENT' | 'TRANSFER'
}

export interface GenerateVerificationResponse {
  code: string
  expires_at: string
}

export interface ValidateVerificationRequest {
  client_id: number
  transaction_id: number
  transaction_type: 'payment' | 'transfer'
  code: string
}

export interface ValidateVerificationResponse {
  valid: boolean
}
