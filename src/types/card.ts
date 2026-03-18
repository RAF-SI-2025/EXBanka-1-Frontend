export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'DEACTIVATED'
export type CardType = 'DEBIT' | 'CREDIT'
export type CardBrand = 'VISA' | 'MASTERCARD' | 'DINA'

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
}
