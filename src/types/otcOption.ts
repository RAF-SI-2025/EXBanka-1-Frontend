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
  // Wire ships `ticker` (human-readable stock symbol, e.g. "AAPL"). The
  // earlier `stock_id` field was a phantom that never appeared on the wire —
  // see normalizeContract() in src/lib/api/otcOption.ts.
  ticker: string
  quantity: string
  strike_price: string
  // Backend wire field is `premium_paid`; the normalizer maps it to `premium`
  // to keep downstream consumers stable.
  premium: string
  settlement_date: string
  buyer: OtcParty
  seller: OtcParty
}

export interface ExerciseContractPayload {
  on_behalf_of_client_id?: number
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
