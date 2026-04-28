export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'DEACTIVATED'
export type CardType = 'DEBIT' | 'CREDIT'
export type CardBrand = 'VISA' | 'MASTERCARD' | 'DINACARD' | 'AMEX'

export interface Card {
  id: number
  card_number: string
  card_type: CardType
  card_name: string
  brand: CardBrand
  created_at: string
  expires_at: string
  account_number: string
  cvv: string
  limit: number
  status: CardStatus
  owner_name: string
  /** Optional virtual-card metadata. Populated only for virtual cards. */
  is_virtual?: boolean
  usage_type?: VirtualCardUsageType
  max_uses?: number
}

export interface CreateCardPayload {
  account_number: string
  owner_id: number
  owner_type: 'AUTHORIZED_PERSON'
  card_brand: CardBrand
}

export type VirtualCardUsageType = 'single_use' | 'multi_use'

export interface CreateVirtualCardPayload {
  account_number: string
  owner_id: number
  card_brand: 'visa' | 'mastercard' | 'dinacard' | 'amex'
  usage_type: VirtualCardUsageType
  max_uses?: number
  expiry_months: 1 | 2 | 3
  card_limit: string
}

export interface VirtualCardResponse {
  id: number
  card_number: string
  card_number_full: string
  card_type: string
  card_brand: string
  account_number: string
  cvv: string
  card_limit: string
  status: string
  owner_type: string
  owner_id: number
  expires_at: string
  created_at: string
}

export interface SetCardPinResponse {
  success: boolean
  message: string
}

export interface VerifyCardPinResponse {
  valid: boolean
  message: string
}
