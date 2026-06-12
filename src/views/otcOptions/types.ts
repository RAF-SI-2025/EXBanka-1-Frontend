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
  // Stable local surrogate id (spec §47.2 GET /otc/options). This — NOT
  // `offer_id` — is the id used to address the listing on this bank's
  // `/otc/options/:id/...` routes (bid, negotiations, timeline). The discovery
  // feed documents it as `local_id`; the live backend also surfaces it as a
  // bare `id` (the single-offer response, §47.2). `resolveListingId` accepts
  // either. For local rows it is the numeric offer id; for remote rows it is
  // the folded-in mirror's id.
  local_id?: number
  id?: number
  // The hosting bank's native offer id. For remote rows this is the peer's id
  // (a string like "42"); for local rows it may be absent. Carried for the
  // cross-bank cascade key (`parent_offer_id`), NOT for addressing — see
  // `resolveListingId`.
  offer_id?: string | number
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
  // When explicitly `false`, the seller posted the listing without a starting
  // strike/premium (no preset terms) — the first bidder names the opening
  // position. The marketplace table then shows a placeholder across the
  // strike + premium columns instead of (absent) numbers. Omitted/`true` ⇒ the
  // listing carries its own starting terms.
  has_preset_terms?: boolean
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
  // Viewer-relative action hints computed per caller by the backend
  // (REST_API_v3 §47.2). The FE renders buttons directly from these instead of
  // re-deriving turn rules. Normalized at the API boundary: absent ⇒ false / ''.
  viewer_role: '' | 'bidder' | 'poster'
  last_action_mine: boolean
  awaiting_viewer: boolean
  can_accept: boolean
  can_counter: boolean
  can_reject: boolean
  can_withdraw: boolean
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
  // The actor that authored this revision. The backend identifies it either by
  // a concrete principal (`owner_type` + numeric `owner_id`) or — for some
  // chains — by trade role only (`"buyer"`/`"seller"`) with no numeric id. So
  // `type` is a free string (owner type OR role) and `id` may be null. Use
  // `formatActor` to render. Normalized at the API boundary by
  // `normalizeRevision`.
  action_by_principal_type: string
  action_by_principal_id: number | null
  created_at: string
  // Viewer-relative flags (REST_API_v3 §47.2). Normalized: absent ⇒ false.
  mine: boolean
  is_latest: boolean
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
  // Actor type/id — same dual identity as OtcNegotiationRevision (concrete
  // principal OR trade role with no id). Alternate id keys the backend may use.
  action_by_principal_type: string
  action_by_principal_id?: number | null
  action_by_owner_id?: number | string | null
  action_by_id?: number | string | null
  actor_id?: number | string | null
  created_at: string
  // Per-caller / per-chain flags on the merged timeline. Hook defaults to false.
  mine?: boolean
  is_latest?: boolean
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
  // Local (intra-bank) accept: the formation saga runs inline, so a 200 carries
  // a non-null `contract` (a genuine abort is a 412, never a 200). Cross-bank
  // accept: the contract is minted asynchronously on the counterparty bank via
  // SI-TX settlement, so the synchronous 200 has `contract: null` plus this
  // `cross_bank_transaction_id`. A 200 with `contract: null` therefore always
  // means "cross-bank, settling async" — NOT an abort.
  contract: OptionContractLite | null
  cross_bank_transaction_id?: string
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
  account_id: number
}

// PUT /me/otc/options/:id — owner-only. Changes the listing's amount of stock.
export interface UpdateOtcOptionPayload {
  quantity: string
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
