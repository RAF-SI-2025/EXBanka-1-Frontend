import {
  latestRevisionForChain,
  latestChainRevision,
  counterpartyAuthoredLatest,
  counterpartyAuthoredLatestRevision,
} from '@/views/otcOptions/lib/chainTurn'
import type { RevisionWithChain } from '@/views/otcOptions/hooks/useOtcOptionsLists'
import type { OtcNegotiationRevision } from '@/views/otcOptions/types'

// Minimal factory — fills every required RevisionWithChain field
function makeRevision(
  overrides: Partial<RevisionWithChain> & {
    negotiation_id: number
    revision_number: number
    mine?: boolean
  }
): RevisionWithChain {
  return {
    id: overrides.revision_number,
    action: 'BID',
    quantity: '10',
    strike_price: '150.00',
    premium: '5.00',
    settlement_date: '2027-01-01',
    created_at: '2026-06-01T00:00:00Z',
    action_by_principal_type: 'client',
    action_by_principal_id: null,
    mine: false,
    is_latest: false,
    chain_id: overrides.negotiation_id,
    chain_bidder: { owner_type: 'client', owner_id: 5 },
    ...overrides,
  } as RevisionWithChain
}

// ---- latestRevisionForChain -------------------------------------------------

describe('latestRevisionForChain', () => {
  it('returns null when the timeline is empty', () => {
    expect(latestRevisionForChain([], 7)).toBeNull()
  })

  it('returns null when no revision belongs to the given negotiation', () => {
    const timeline = [makeRevision({ negotiation_id: 99, revision_number: 1 })]
    expect(latestRevisionForChain(timeline, 7)).toBeNull()
  })

  it('returns the single matching revision when only one exists', () => {
    const rev = makeRevision({ negotiation_id: 7, revision_number: 1 })
    expect(latestRevisionForChain([rev], 7)).toBe(rev)
  })

  it('picks the entry with the highest revision_number for the matching negotiation', () => {
    const rev1 = makeRevision({ negotiation_id: 7, revision_number: 1 })
    const rev2 = makeRevision({ negotiation_id: 7, revision_number: 2 })
    const rev3 = makeRevision({ negotiation_id: 7, revision_number: 3 })
    // Shuffle order to prove it is order-independent
    expect(latestRevisionForChain([rev3, rev1, rev2], 7)).toBe(rev3)
  })

  it('ignores revisions from other negotiation chains', () => {
    const mine = makeRevision({ negotiation_id: 7, revision_number: 1 })
    const other = makeRevision({ negotiation_id: 99, revision_number: 99 })
    expect(latestRevisionForChain([other, mine], 7)).toBe(mine)
  })
})

// ---- latestChainRevision ----------------------------------------------------

function makeOtcRevision(
  overrides: Partial<OtcNegotiationRevision> & { revision_number: number; mine?: boolean }
): OtcNegotiationRevision {
  return {
    id: overrides.revision_number,
    negotiation_id: 1,
    action: 'BID',
    quantity: '10',
    strike_price: '150.00',
    premium: '5.00',
    settlement_date: '2027-01-01',
    created_at: '2026-06-01T00:00:00Z',
    action_by_principal_type: 'client',
    action_by_principal_id: null,
    mine: false,
    is_latest: false,
    ...overrides,
  }
}

describe('latestChainRevision', () => {
  it('returns null when revisions list is empty', () => {
    expect(latestChainRevision([])).toBeNull()
  })

  it('returns the single revision when only one exists', () => {
    const rev = makeOtcRevision({ revision_number: 1 })
    expect(latestChainRevision([rev])).toBe(rev)
  })

  it('picks the revision with the highest revision_number (order-independent)', () => {
    const rev1 = makeOtcRevision({ revision_number: 1 })
    const rev2 = makeOtcRevision({ revision_number: 2 })
    const rev3 = makeOtcRevision({ revision_number: 3 })
    expect(latestChainRevision([rev3, rev1, rev2])).toBe(rev3)
  })
})

// ---- counterpartyAuthoredLatest ---------------------------------------------

describe('counterpartyAuthoredLatest', () => {
  it('returns null when the chain has no revisions yet', () => {
    expect(counterpartyAuthoredLatest([], 7)).toBeNull()
  })

  it('returns null when no revision belongs to the given negotiation', () => {
    const timeline = [makeRevision({ negotiation_id: 99, revision_number: 1, mine: false })]
    expect(counterpartyAuthoredLatest(timeline, 7)).toBeNull()
  })

  it('returns true (caller may act) when latest revision has mine: false', () => {
    // mine: false → the counterparty authored it → caller's turn
    const timeline = [makeRevision({ negotiation_id: 7, revision_number: 1, mine: false })]
    expect(counterpartyAuthoredLatest(timeline, 7)).toBe(true)
  })

  it('returns false (waiting) when latest revision has mine: true', () => {
    // mine: true → caller authored the latest → waiting for counterparty
    const timeline = [
      makeRevision({ negotiation_id: 7, revision_number: 1, mine: false }),
      makeRevision({ negotiation_id: 7, revision_number: 2, mine: true }),
    ]
    expect(counterpartyAuthoredLatest(timeline, 7)).toBe(false)
  })

  it('uses the highest revision_number regardless of order', () => {
    const rev1 = makeRevision({ negotiation_id: 7, revision_number: 1, mine: true })
    const rev2 = makeRevision({ negotiation_id: 7, revision_number: 2, mine: false })
    // rev2 is latest; mine: false → counterparty authored → caller's turn
    expect(counterpartyAuthoredLatest([rev2, rev1], 7)).toBe(true)
  })
})

// ---- counterpartyAuthoredLatestRevision -------------------------------------

describe('counterpartyAuthoredLatestRevision', () => {
  it('returns null when revisions list is empty', () => {
    expect(counterpartyAuthoredLatestRevision([])).toBeNull()
  })

  it('returns true (caller may act) when latest revision has mine: false', () => {
    const revs = [
      makeOtcRevision({ revision_number: 1, mine: true }),
      makeOtcRevision({ revision_number: 2, mine: false }),
    ]
    expect(counterpartyAuthoredLatestRevision(revs)).toBe(true)
  })

  it('returns false (waiting) when latest revision has mine: true', () => {
    const revs = [
      makeOtcRevision({ revision_number: 1, mine: false }),
      makeOtcRevision({ revision_number: 2, mine: true }),
    ]
    expect(counterpartyAuthoredLatestRevision(revs)).toBe(false)
  })

  it('picks the revision with the highest revision_number (order-independent)', () => {
    const rev1 = makeOtcRevision({ revision_number: 1, mine: false })
    const rev2 = makeOtcRevision({ revision_number: 2, mine: true })
    // rev2 is latest; mine: true → caller authored → waiting
    expect(counterpartyAuthoredLatestRevision([rev2, rev1])).toBe(false)
  })
})
