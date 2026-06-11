import type { OtcOptionRow } from '@/views/otcOptions/types'

// The id used to address a listing on this bank's `/otc/options/:id/...` routes
// (bid, negotiations, timeline, counter, accept, reject, cancel) is the stable
// local surrogate — spec §47.2 GET /otc/options:
//   "Stable local surrogate id … Use this as `:id` in GET /otc/options/:id."
//
// The surrogate's field name differs across the backend's responses: the
// discovery feed documents it as `local_id`, while the live single-offer
// response surfaces it as a bare `id`. We accept either. `offer_id` is the
// hosting bank's native id (the peer's id for remote rows; a string like "42"),
// kept only for the cross-bank cascade key — for LOCAL rows the backend omits
// it entirely, so reading it as the path id produced `Number(undefined)` ===
// NaN and the `/otc/options/NaN/bid` request that the gateway rejects with
// `{"error":{"code":"validation_error","message":"invalid id"}}`.
//
// Resolution order: `local_id` → `id` → `offer_id`. Returns NaN only when none
// is present (callers' `enabled`/guard checks reject NaN, and the bid path is
// gated by a real offer being selected first).
export function resolveListingId(row: Pick<OtcOptionRow, 'local_id' | 'id' | 'offer_id'>): number {
  return Number(row.local_id ?? row.id ?? row.offer_id)
}

// React key for a marketplace row. The positional `index` GUARANTEES uniqueness
// among siblings even when a row has no resolvable id (live rows whose id field
// the FE doesn't recognise → `resolveListingId` is NaN) or when the backend
// returns the same listing twice. Without it, colliding `bank-NaN` keys made
// React keep stale rows across refetches, so options appeared to duplicate on
// refresh. The resolved id is kept in the key so an unchanged row at a stable
// position keeps a stable identity.
export function otcRowKey(
  row: Pick<OtcOptionRow, 'bank_code' | 'local_id' | 'id' | 'offer_id'>,
  index: number
): string {
  return `${row.bank_code}-${resolveListingId(row)}-${index}`
}
