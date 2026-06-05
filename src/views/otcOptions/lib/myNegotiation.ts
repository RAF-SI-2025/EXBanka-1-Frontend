// The discovery feed (`GET /otc/options`) sets `my_negotiation_id` to the
// caller's own (bidder) negotiation-chain id on a listing once a chain exists,
// and omits it — sending 0 — when the caller has never bid (spec §47.2). A
// numeric, positive id therefore means "bidding has already started", so the
// marketplace row offers **Counter**; anything else (absent / 0 / non-numeric)
// means there is no chain yet, so it offers **Bid**.
export function hasOwnNegotiationChain(
  myNegotiationId: number | string | null | undefined
): boolean {
  if (typeof myNegotiationId === 'number') {
    return Number.isFinite(myNegotiationId) && myNegotiationId > 0
  }
  if (typeof myNegotiationId === 'string') {
    const n = Number(myNegotiationId)
    return myNegotiationId.trim() !== '' && Number.isFinite(n) && n > 0
  }
  return false
}
