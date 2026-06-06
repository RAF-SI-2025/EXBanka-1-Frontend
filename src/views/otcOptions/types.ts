// Local, module-private types for the OTC Options view module.
// Kept here (not in src/types/) so the module is self-contained.

export type OtcOptionDirection = 'sell_initiated' | 'buy_initiated'

export type OtcOptionListingStatus = 'open' | 'consumed' | 'cancelled' | 'expired'

export type OtcNegotiationStatus =
  | 'open'
  // `ongoing` is the peer status vocabulary cross-bank/remote chains use for
  // an active negotiation (spec §47.2 — bid returns `open` local / `ongoing`
  // remote). Treated as active alongside `open`/`countered`.
  | 'ongoing'
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
  // SP-1/SP-2b ownership + own-chain fields (spec §47.2). `me_owner` is true
  // when the caller is this listing's poster (always false for remote rows;
  // omitted when not owned). `my_negotiation_id` is the caller's own
  // bidder-chain id on this offer — a positive number once a chain exists,
  // omitted/0 when the caller has never bid here. `my_negotiation_status` is
  // that chain's status when present.
  me_owner?: boolean
  my_negotiation_id?: number | string | null
  my_negotiation_status?: string
}

export interface OtcOptionsDiscoveryResponse {
  offers: OtcOptionRow[]
  total_count: number
  peers_total?: number
  peers_reached?: number
  partial?: boolean
  last_refresh?: string
}

// GET /me/otc/options now returns the same marketplace shape as the
// discovery endpoint, scoped to the caller's own open listings via the
// server-side `owner_only_seller_id` filter on the unified cache. So
// `MyOtcOptionsResponse` is just an alias — kept as a named type so the
// API surface still reads intentionally.
export type MyOtcOptionsResponse = OtcOptionsDiscoveryResponse

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

// One row of GET /me/otc/options/negotiations/:nid/revisions — the immutable
// audit log of a chain (BID -> COUNTER* -> ACCEPT/REJECT).
export type OtcRevisionAction = 'BID' | 'COUNTER' | 'ACCEPT' | 'REJECT'

export interface OtcNegotiationRevision {
  id: number
  negotiation_id: number
  revision_number: number
  action: OtcRevisionAction
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string
  action_by_principal_type: OtcOwnerType
  action_by_principal_id: number
  created_at: string
}

export interface OtcNegotiationRevisionsResponse {
  revisions: OtcNegotiationRevision[]
}

// ---- Offer timeline (GET /otc/options/:id/timeline) -------------------------

// One entry of a listing's cross-chain activity timeline — every bidder's
// revisions merged server-side into a single stream (spec §47.2). Owner-only
// view: the listing poster (or an `otc.read.all` employee) sees all chains;
// competing bidders get 403. Bidder identity rides flat on each entry, so the
// hook lifts it onto the shared `RevisionWithChain` shape for rendering.
export interface OtcTimelineEntry {
  negotiation_id: number
  bidder_owner_type: OtcOwnerType
  bidder_owner_id: number | null
  revision_number: number
  action: OtcRevisionAction
  quantity: string
  strike_price: string
  premium: string | null
  settlement_date: string
  action_by_principal_type: OtcOwnerType
  action_by_principal_id: number
  created_at: string
}

export interface OtcOfferTimelineResponse {
  // Listing header (OTCOfferResponse). The owner Activity panel already has the
  // offer via props and renders only `timeline`, so this is typed loosely.
  offer?: unknown
  timeline: OtcTimelineEntry[]
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

// ---- Picker lookups ---------------------------------------------------------

// Sell-direction ticker picker reads holdings from the shared
// `PortfolioResponse` (spec §48.1) — see `getPortfolio` / `SecurityPosition`
// in `@/types/portfolio`. No module-local type needed.

// Subset of /securities/stocks Stock the catalog picker needs for buy-direction
// listings (any tradable ticker is valid).
export interface StockLite {
  id: number
  ticker: string
  name: string
}

export interface StockCatalogResponse {
  stocks: StockLite[]
  total_count: number
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
  // Optional (spec §47.2). When non-zero, accepts on behalf of an investment
  // fund; `acceptor_account_id` must equal the fund's RSD account and the
  // caller must be the fund's manager. The minted contract records the fund id.
  on_behalf_of_fund_id?: number
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
  // Discovery filters per spec §47.2 (`GET /otc/options`). `kind`/`bank_code`
  // are accepted but redundant on `GET /me/otc/options` (always kind=local).
  kind?: 'local' | 'remote'
  bank_code?: string
  page?: number
  page_size?: number
}
