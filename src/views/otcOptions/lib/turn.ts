import type { OtcNegotiation, OtcParty } from '@/views/otcOptions/types'

export function partiesMatch(a: OtcParty, b: OtcParty): boolean {
  return a.owner_type === b.owner_type && a.owner_id === b.owner_id
}

// OTC negotiation chains are strictly turn-based: a party may advance the chain
// (counter / accept / reject) only when the OTHER side moved last. The backend
// enforces this — it rejects an out-of-turn counter with 409 "not your turn:
// the last counter-offer was made by your side", and the accept path verifies
// the caller is the opposite party to `last_action_by` (REST_API_v3 §47.2 step
// 4). We mirror it in the UI so the action controls disappear when it isn't the
// caller's turn instead of letting them fire a request the backend will reject.
//
// `last_action_by` is the source of truth. When it is absent (e.g. older data
// that didn't carry it), we cannot decide turn, so we DON'T block — the backend
// stays the final arbiter.

type TurnFields = Pick<OtcNegotiation, 'last_action_by' | 'bidder'>

// True when the chain's own bidder made the most recent move; null when unknown.
export function bidderMovedLast(neg: TurnFields): boolean | null {
  if (!neg.last_action_by || !neg.bidder) return null
  return partiesMatch(neg.last_action_by, neg.bidder)
}

// Whether the listing owner may act on this chain now (the bidder moved last).
// The owner side uses this rather than matching the caller's own identity: a
// bank-acting employee's principal may not equal how the backend recorded the
// owner's action, but the bidder identity is stable — comparing `last_action_by`
// against the chain's `bidder` is identity-robust. Unknown ⇒ allowed.
export function isOwnerTurn(neg: TurnFields): boolean {
  const moved = bidderMovedLast(neg)
  return moved == null ? true : moved
}

// Whether `me` may act on this chain now (the other side moved last). Used by
// the bidder side, where `me` (the logged-in bidder) reliably equals how the
// backend recorded the bidder's action. Unknown ⇒ allowed.
export function isCallerTurn(neg: Pick<OtcNegotiation, 'last_action_by'>, me: OtcParty): boolean {
  if (!neg.last_action_by) return true
  return !partiesMatch(neg.last_action_by, me)
}
