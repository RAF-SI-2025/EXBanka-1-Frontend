import type { OtcOffer } from '@/types/otc'

// Semantic identity of an offer row. Local offers key on their surrogate id;
// remote offers key on bank+owner+ticker, plus the option surrogate id when
// present so a stock and an option on the same ticker from the same bank differ.
export function offerKey(offer: OtcOffer): string {
  if (offer.kind === 'local') return `local-${offer.id}`
  const suffix = offer.id != null ? `-${offer.id}` : ''
  return `remote-${offer.bank_code}-${offer.owner_id}-${offer.ticker}${suffix}`
}

// React row key. The positional `index` GUARANTEES uniqueness even when the
// semantic key collides — a local offer whose id the FE doesn't recognise
// (`local-undefined`) or two remote rows sharing bank+owner+ticker with no id.
// Colliding sibling keys made React keep stale rows across refetches, so the
// market table appeared to duplicate offers on refresh.
export function offerRowKey(offer: OtcOffer, index: number): string {
  return `${offerKey(offer)}-${index}`
}

// Remove duplicate offers, preserving first-seen order. The signature is the
// full offer content, so an entry is dropped only when it is identical in every
// field to one already kept — exact repeats (the backend returning a listing
// twice) collapse, while any genuinely-distinct offer (differing in id, price,
// quantity, timestamp, …) always survives. This cannot hide a real offer.
export function dedupeOffers(offers: OtcOffer[]): OtcOffer[] {
  const seen = new Set<string>()
  return offers.filter((offer) => {
    const signature = JSON.stringify(offer)
    if (seen.has(signature)) return false
    seen.add(signature)
    return true
  })
}
