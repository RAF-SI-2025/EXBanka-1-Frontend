/**
 * Surviving types for OTC option contracts (the post-acceptance artefact).
 * The OTC option offers/negotiations surface was removed; only the contract
 * lifecycle remains exposed in the UI, via /me/otc/contracts and the
 * exercise endpoint.
 */

// Carried over because OtcOptionStatusBadge still renders contract statuses
// alongside the legacy offer-status palette used by other (non-options)
// status rows in the OTC area.
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

export interface OtcParty {
  owner_type: 'client' | 'bank' | 'employee'
  owner_id: number | null
}

export interface OptionContract {
  id: number
  status: OptionContractStatus
  // Provenance from the unified /me/otc/contracts response (REST_API_v3 §30):
  // `local` = intra-bank contract, `remote` = cross-bank peer contract this
  // bank holds the buyer side of. A `remote` contract requires
  // `buyer_account_number` on exercise; a `local` one ignores it.
  kind: 'local' | 'remote'
  // Wire ships `ticker` (human-readable stock symbol, e.g. "AAPL"). The
  // earlier `stock_id` field was a phantom that never appeared on the wire —
  // see normalizeContract() in src/lib/api/otcOption.ts.
  ticker: string
  quantity: string
  strike_price: string
  // Currency the strike is denominated in. Projected from the mirrored
  // cross-bank option for `remote` contracts; used to filter the buyer's
  // eligible strike accounts when exercising.
  strike_currency?: string
  // Backend wire field is `premium_paid`; the normalizer maps it to `premium`
  // to keep downstream consumers stable.
  premium: string
  settlement_date: string
  buyer: OtcParty
  seller: OtcParty
}

export interface ExerciseContractPayload {
  // Required for a cross-bank (remote) contract: the buyer's currency account
  // that pays the strike. Ignored for a local contract. Spec §30 exercise body.
  buyer_account_number?: string
  on_behalf_of_client_id?: number
  // Optional (spec §30, E2/Plan E). When non-zero, exercises on behalf of an
  // investment fund (local path); acquired shares land in `fund_holdings`.
  on_behalf_of_fund_id?: number
}

export interface MyContractsFilters {
  role?: 'buyer' | 'seller' | 'either'
  page?: number
  page_size?: number
}

export interface MyOtcContractsResponse {
  contracts: OptionContract[]
  total: number
}

export interface ExerciseOtcContractResponse {
  contract: OptionContract
  holding: { id: number; stock_id: number; quantity: string; owner: OtcParty }
}
