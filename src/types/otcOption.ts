export type OtcOfferDirection = 'sell_initiated' | 'buy_initiated'
/**
 * Listing status under /otc/options. Phase 8 introduces `open`/`consumed`/
 * `cancelled`; older `PENDING`/`ACCEPTED`/`REJECTED`/`EXPIRED` values are
 * kept here for any legacy data still in flight.
 */
export type OtcOfferStatus =
  | 'open'
  | 'consumed'
  | 'cancelled'
  | 'expired'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
export type OptionContractStatus = 'ACTIVE' | 'EXERCISED' | 'EXPIRED'

/** Per-chain status under /me/otc/options/:id/negotiations/:nid. */
export type OtcNegotiationStatus =
  | 'open'
  | 'countered'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'failed'

export interface OtcParty {
  owner_type: 'client' | 'bank' | 'employee'
  owner_id: number | null
}

export interface OtcOffer {
  id: number
  direction: OtcOfferDirection
  status: OtcOfferStatus
  stock_id: number
  /**
   * Stock ticker symbol — present on /otc/options entries, may be absent
   * on legacy /me/otc/options rows. UI should fall back to stock_id when
   * undefined.
   */
  ticker?: string
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string
  initiator: OtcParty
  counterparty: OtcParty
  last_modified_at: string
  unread?: boolean
}

export interface OtcNegotiation {
  id: number
  offer_id: number
  status: OtcNegotiationStatus
  bidder: OtcParty
  /** Optional human-readable bidder name when the backend resolves it. */
  bidder_name?: string
  /** Last party that proposed the current terms. The opposite party may accept. */
  last_action_by: OtcParty
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string
  created_at: string
  updated_at: string
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
  ticker: string
  quantity: string
  strike_price: string
  premium?: string
  settlement_date: string
  account_id: number
  counterparty_user_id?: number
  counterparty_system_type?: 'client' | 'employee'
  on_behalf_of_client_id?: number
}

export interface PlaceBidPayload {
  bidder_account_id: number
  quantity: string
  strike_price: string
  premium: string
  settlement_date: string
}

export interface CounterNegotiationPayload {
  quantity?: string
  strike_price?: string
  premium?: string
  settlement_date?: string
  on_behalf_of_client_id?: number
}

export interface AcceptNegotiationPayload {
  acceptor_account_id: number
  on_behalf_of_client_id?: number
}

export interface ExerciseContractPayload {
  on_behalf_of_client_id?: number
}

export interface MyOffersFilters {
  role?: 'initiator' | 'counterparty' | 'either'
  page?: number
  page_size?: number
}

export interface AllOffersFilters {
  page?: number
  page_size?: number
  ticker?: string
  kind?: 'local' | 'remote'
  bank_code?: string
  direction?: OtcOfferDirection
}

export interface MyNegotiationsFilters {
  statuses?: string
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
}

export interface MyOtcOffersResponse {
  offers: OtcOffer[]
  total: number
}

export interface OtcNegotiationListResponse {
  negotiations: OtcNegotiation[]
  total: number
}

export interface MyOtcContractsResponse {
  contracts: OptionContract[]
  total: number
}

export interface AcceptOtcOfferResponse {
  winning: OtcNegotiation
  parent_offer_id: number
  parent_status: OtcOfferStatus
  cancelled_siblings: OtcNegotiation[]
  contract: OptionContract | null
}

export interface ExerciseOtcContractResponse {
  contract: OptionContract
  holding: { id: number; stock_id: number; quantity: string; owner: OtcParty }
}
