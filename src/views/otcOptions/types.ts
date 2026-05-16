// Local, module-private types for the OTC Options view module.
// Kept here (not in src/types/) so the module is self-contained.

export type OtcOptionDirection = 'sell_initiated' | 'buy_initiated'

export type OtcOptionListingStatus = 'open' | 'consumed' | 'cancelled' | 'expired'

export type OtcNegotiationStatus =
  | 'open'
  | 'countered'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'failed'

export type OtcOwnerType = 'client' | 'bank' | 'employee'

export interface OtcParty {
  owner_type: OtcOwnerType
  owner_id: number | null
}

// Row as returned by GET /otc/options (discovery view).
// Field names follow the spec at §47.2.
export interface OtcOptionRow {
  kind: 'local' | 'remote'
  bank_code: string
  routing_number: number
  offer_id: string | number
  seller_id: string | { owner_type: OtcOwnerType; id: string | number }
  seller_name?: string
  direction: OtcOptionDirection
  ticker: string
  amount: number | string
  strike_price: string
  strike_currency: string
  premium: string
  premium_currency: string
  settlement_date: string
  created_at: string
  best_bid?: string
  best_ask?: string
  active_chains_count?: number
}

export interface OtcOptionsDiscoveryResponse {
  offers: OtcOptionRow[]
  total_count: number
  peers_total?: number
  peers_reached?: number
  partial?: boolean
  last_refresh?: string
}

// Row as returned by GET /me/otc/options (poster's own listings).
// Slightly different shape from discovery — has an `initiator` party
// instead of a flat `seller_id` and exposes a listing-level `status`.
export interface MyOtcOptionListing {
  id: number
  direction: OtcOptionDirection
  status: OtcOptionListingStatus
  stock_id: number
  ticker?: string
  quantity: string
  strike_price: string
  strike_currency?: string
  premium: string | null
  premium_currency?: string
  settlement_date: string
  initiator: OtcParty
  created_at: string
  last_modified_at?: string
  active_chains_count?: number
}

export interface MyOtcOptionsResponse {
  offers: MyOtcOptionListing[]
  total: number
}

// One per-bidder negotiation chain against a listing.
export interface OtcNegotiation {
  id: number
  parent_offer_id?: number
  offer_id?: number
  status: OtcNegotiationStatus
  bidder: OtcParty
  bidder_name?: string
  last_action_by?: OtcParty
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string
  created_at: string
  updated_at: string
}

export interface OtcNegotiationsResponse {
  negotiations: OtcNegotiation[]
  total: number
}

// ---- Response shapes --------------------------------------------------------

// Subset of the OptionContract surface we need to confirm the formation saga
// actually minted a contract on accept. See spec §47.2 stage 2 — contract is
// `null` when the saga aborts (e.g. seller short on shares at saga step 1,
// or buyer short on cash at step 2).
export interface OptionContractLite {
  id: number
  ticker?: string
}

export interface AcceptNegotiationResponse {
  winning: OtcNegotiation
  parent_offer_id?: number
  parent_status?: OtcOptionListingStatus
  cancelled_siblings?: OtcNegotiation[]
  contract: OptionContractLite | null
}

// ---- Mutation payloads ------------------------------------------------------

export interface CreateOtcOptionPayload {
  direction: OtcOptionDirection
  ticker: string
  quantity: string
  strike_price: string
  premium: string
  settlement_date: string
  account_id: number
}

export interface PlaceBidPayload {
  bidder_account_id: number
  quantity: string
  strike_price: string
  premium: string
  settlement_date: string
}

export interface CounterNegotiationPayload {
  quantity: string
  strike_price: string
  premium: string
  settlement_date: string
}

export interface AcceptNegotiationPayload {
  acceptor_account_id: number
}

// What the UI passes to the smart bid-or-counter hook. The hook decides
// whether to POST /bid or fall back to /counter based on the backend's
// 409 response (one chain per bidder per listing).
export interface BidOrCounterInput {
  offer_id: number
  account_id: number
  quantity: string
  strike_price: string
  premium: string
  settlement_date: string
  // Caller's own bidder party (used to find the existing chain on 409
  // fallback). owner_type+owner_id together identify the chain.
  bidder: OtcParty
}

// ---- Filter / view-state types ---------------------------------------------

export type OtcOptionsMode = 'all' | 'my'

export interface OtcOptionsListFilters {
  ticker?: string
  direction?: OtcOptionDirection
  page?: number
  page_size?: number
}
