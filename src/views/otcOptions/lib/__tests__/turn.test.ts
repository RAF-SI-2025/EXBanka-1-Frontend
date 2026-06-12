import {
  latestRevisionForChain,
  latestChainRevision,
  counterpartyAuthoredLatest,
  counterpartyAuthoredLatestRevision,
} from '@/views/otcOptions/lib/chainTurn'
import type { RevisionWithChain } from '@/views/otcOptions/hooks/useOtcOptionsLists'
import type { OtcNegotiationRevision } from '@/views/otcOptions/types'

// ---- Factories --------------------------------------------------------------

function makeTimelineEntry(
  negotiation_id: number,
  revision_number: number,
  mine: boolean
): RevisionWithChain {
  return {
    id: revision_number,
    negotiation_id,
    revision_number,
    action: 'BID',
    quantity: '10',
    strike_price: '150.00',
    premium: '5.00',
    settlement_date: '2027-01-01',
    created_at: '2026-06-01T00:00:00Z',
    action_by_principal_type: 'client',
    action_by_principal_id: null,
    mine,
    is_latest: false,
    chain_id: negotiation_id,
    chain_bidder: { owner_type: 'client', owner_id: 5 },
  } as RevisionWithChain
}

function makeRevision(revision_number: number, mine: boolean): OtcNegotiationRevision {
  return {
    id: revision_number,
    negotiation_id: 1,
    revision_number,
    action: 'BID',
    quantity: '10',
    strike_price: '150.00',
    premium: '5.00',
    settlement_date: '2027-01-01',
    created_at: '2026-06-01T00:00:00Z',
    action_by_principal_type: 'client',
    action_by_principal_id: null,
    mine,
    is_latest: revision_number === 2,
  }
}

// ---- latestRevisionForChain -------------------------------------------------

describe('latestRevisionForChain', () => {
  it('returns null when the timeline is empty', () => {
    expect(latestRevisionForChain([], 7)).toBeNull()
  })

  it('returns null when no revision belongs to the given negotiation', () => {
    const timeline = [makeTimelineEntry(99, 1, false)]
    expect(latestRevisionForChain(timeline, 7)).toBeNull()
  })

  it('picks the entry with the highest revision_number (order-independent)', () => {
    const rev1 = makeTimelineEntry(7, 1, false)
    const rev2 = makeTimelineEntry(7, 2, true)
    const rev3 = makeTimelineEntry(7, 3, false)
    // Shuffle to confirm order independence
    expect(latestRevisionForChain([rev3, rev1, rev2], 7)).toBe(rev3)
  })

  it('ignores entries from other chains', () => {
    const mine = makeTimelineEntry(7, 1, false)
    const other = makeTimelineEntry(99, 99, false)
    expect(latestRevisionForChain([other, mine], 7)).toBe(mine)
  })
})

// ---- latestChainRevision ----------------------------------------------------

describe('latestChainRevision', () => {
  it('returns null when revisions list is empty', () => {
    expect(latestChainRevision([])).toBeNull()
  })

  it('picks the revision with the highest revision_number (order-independent)', () => {
    const rev1 = makeRevision(1, true)
    const rev2 = makeRevision(2, false)
    expect(latestChainRevision([rev2, rev1])).toBe(rev2)
  })
})

// ---- counterpartyAuthoredLatest ---------------------------------------------

describe('counterpartyAuthoredLatest', () => {
  it('returns null when the chain has no entries in the timeline', () => {
    expect(counterpartyAuthoredLatest([], 7)).toBeNull()
  })

  it('returns true (caller may act) when latest entry has mine: false', () => {
    // mine: false → counterparty authored the last revision → caller's turn
    const timeline = [makeTimelineEntry(7, 1, false)]
    expect(counterpartyAuthoredLatest(timeline, 7)).toBe(true)
  })

  it('returns false (waiting) when latest entry has mine: true', () => {
    // BID rev1 mine:false, COUNTER rev2 mine:true → caller authored latest → waiting
    const timeline = [makeTimelineEntry(7, 1, false), makeTimelineEntry(7, 2, true)]
    expect(counterpartyAuthoredLatest(timeline, 7)).toBe(false)
  })

  it('ignores entries from other chains and returns null if no matching entry', () => {
    const timeline = [makeTimelineEntry(99, 1, false)]
    expect(counterpartyAuthoredLatest(timeline, 7)).toBeNull()
  })
})

// ---- counterpartyAuthoredLatestRevision -------------------------------------

describe('counterpartyAuthoredLatestRevision', () => {
  it('returns null when revisions list is empty', () => {
    expect(counterpartyAuthoredLatestRevision([])).toBeNull()
  })

  it('returns true (caller may act) when latest revision has mine: false', () => {
    // mine: false on latest → counterparty moved → caller's turn
    const revs = [makeRevision(1, true), makeRevision(2, false)]
    expect(counterpartyAuthoredLatestRevision(revs)).toBe(true)
  })

  it('returns false (waiting) when latest revision has mine: true', () => {
    // mine: true on latest → caller moved last → waiting
    const revs = [makeRevision(1, false), makeRevision(2, true)]
    expect(counterpartyAuthoredLatestRevision(revs)).toBe(false)
  })
})
