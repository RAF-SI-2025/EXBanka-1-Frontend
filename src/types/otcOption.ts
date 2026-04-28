export type OtcOfferDirection = 'sell_initiated' | 'buy_initiated'
export type OtcOfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
export type OptionContractStatus = 'ACTIVE' | 'EXERCISED' | 'EXPIRED'

export interface OtcParty {
  owner_type: 'client' | 'bank'
  owner_id: number | null
}

export interface OtcOffer {
  id: number
  direction: OtcOfferDirection
  status: OtcOfferStatus
  stock_id: number
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string
  initiator: OtcParty
  counterparty: OtcParty
  last_modified_at: string
  unread?: boolean
}

export interface OtcOfferRevision {
  revision_number: number
  modified_by: { principal_type: 'client' | 'employee'; principal_id: number }
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string
  created_at: string
}

export interface OptionContract {
  id: number
  status: OptionContractStatus
  stock_id: number
  quantity: string
  strike_price: string
  premium: string
  settlement_date: string
  buyer: OtcParty
  seller: OtcParty
}

export interface CreateOtcOfferPayload {
  direction: OtcOfferDirection
  stock_id: number
  quantity: string
  strike_price: string
  premium?: string
  settlement_date: string
  counterparty_user_id?: number
  counterparty_system_type?: 'client' | 'employee'
}

export interface CounterOtcOfferPayload {
  quantity?: string
  strike_price?: string
  premium?: string
  settlement_date?: string
}

export interface AcceptOtcOfferPayload {
  buyer_account_id: number
  seller_account_id: number
}

export interface ExerciseContractPayload {
  buyer_account_id: number
  seller_account_id: number
}

export interface MyOffersFilters {
  role?: 'initiator' | 'counterparty' | 'either'
  page?: number
  page_size?: number
}

export interface MyContractsFilters {
  role?: 'buyer' | 'seller' | 'either'
  page?: number
  page_size?: number
}

export interface OtcOfferDetailResponse {
  offer: OtcOffer
  revisions: OtcOfferRevision[]
}

export interface MyOtcOffersResponse {
  offers: OtcOffer[]
  total: number
}

export interface MyOtcContractsResponse {
  contracts: OptionContract[]
  total: number
}

export interface AcceptOtcOfferResponse {
  offer: OtcOffer
  contract: OptionContract
}

export interface ExerciseOtcContractResponse {
  contract: OptionContract
  holding: { id: number; stock_id: number; quantity: string; owner: OtcParty }
}
