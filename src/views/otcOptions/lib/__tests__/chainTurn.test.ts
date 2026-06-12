import { latestRevisionForChain, bidderAuthoredLatest } from '@/views/otcOptions/lib/chainTurn'
import type { RevisionWithChain } from '@/views/otcOptions/hooks/useOtcOptionsLists'

// Minimal factory — fills every required RevisionWithChain field
function makeRevision(
  overrides: Partial<RevisionWithChain> & {
    negotiation_id: number
    revision_number: number
    action_by_principal_type: string
    action_by_principal_id?: number | null
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
    mine: false,
    is_latest: false,
    chain_id: overrides.negotiation_id,
    chain_bidder: { owner_type: 'client', owner_id: 5 },
    action_by_principal_id: null,
    ...overrides,
  } as RevisionWithChain
}

// ---- latestRevisionForChain -------------------------------------------------

describe('latestRevisionForChain', () => {
  it('returns null when the timeline is empty', () => {
    expect(latestRevisionForChain([], 7)).toBeNull()
  })

  it('returns null when no revision belongs to the given negotiation', () => {
    const timeline = [
      makeRevision({ negotiation_id: 99, revision_number: 1, action_by_principal_type: 'client' }),
    ]
    expect(latestRevisionForChain(timeline, 7)).toBeNull()
  })

  it('returns the single matching revision when only one exists', () => {
    const rev = makeRevision({
      negotiation_id: 7,
      revision_number: 1,
      action_by_principal_type: 'client',
    })
    expect(latestRevisionForChain([rev], 7)).toBe(rev)
  })

  it('picks the entry with the highest revision_number for the matching negotiation', () => {
    const rev1 = makeRevision({
      negotiation_id: 7,
      revision_number: 1,
      action_by_principal_type: 'client',
    })
    const rev2 = makeRevision({
      negotiation_id: 7,
      revision_number: 2,
      action_by_principal_type: 'seller',
    })
    const rev3 = makeRevision({
      negotiation_id: 7,
      revision_number: 3,
      action_by_principal_type: 'bank',
    })
    // Shuffle order to prove it is order-independent
    expect(latestRevisionForChain([rev3, rev1, rev2], 7)).toBe(rev3)
  })

  it('ignores revisions from other negotiation chains', () => {
    const mine = makeRevision({
      negotiation_id: 7,
      revision_number: 1,
      action_by_principal_type: 'client',
    })
    const other = makeRevision({
      negotiation_id: 99,
      revision_number: 99,
      action_by_principal_type: 'client',
    })
    expect(latestRevisionForChain([other, mine], 7)).toBe(mine)
  })
})

// ---- bidderAuthoredLatest ---------------------------------------------------

describe('bidderAuthoredLatest', () => {
  const bidder = { owner_type: 'client' as const, owner_id: 5 }

  it('returns null when the chain has no revisions yet', () => {
    expect(bidderAuthoredLatest([], 7, bidder, 'sell_initiated')).toBeNull()
  })

  describe('local chains (concrete principal type)', () => {
    it('returns true when the latest revision was authored by the bidder principal', () => {
      // Latest by the bidder (client, id 5) → owner's turn
      const timeline = [
        makeRevision({
          negotiation_id: 7,
          revision_number: 1,
          action_by_principal_type: 'client',
          action_by_principal_id: 5,
        }),
      ]
      expect(bidderAuthoredLatest(timeline, 7, bidder, 'sell_initiated')).toBe(true)
    })

    it('returns false when the latest revision was authored by someone other than the bidder (owner moved last)', () => {
      // Owner bank countered last → bidder's turn
      const timeline = [
        makeRevision({
          negotiation_id: 7,
          revision_number: 1,
          action_by_principal_type: 'client',
          action_by_principal_id: 5,
        }),
        makeRevision({
          negotiation_id: 7,
          revision_number: 2,
          action_by_principal_type: 'bank',
          action_by_principal_id: null,
        }),
      ]
      expect(bidderAuthoredLatest(timeline, 7, bidder, 'sell_initiated')).toBe(false)
    })

    it('returns false when principal type matches but id does not', () => {
      // Another client, not the bidder
      const timeline = [
        makeRevision({
          negotiation_id: 7,
          revision_number: 1,
          action_by_principal_type: 'client',
          action_by_principal_id: 99,
        }),
      ]
      expect(bidderAuthoredLatest(timeline, 7, bidder, 'sell_initiated')).toBe(false)
    })
  })

  describe('remote chains — sell listing (bidder is buyer)', () => {
    it('returns true when the latest revision author is "buyer" on a sell listing', () => {
      // sell listing → bidder = buyer; buyer acted last → owner's turn
      const timeline = [
        makeRevision({
          negotiation_id: 7,
          revision_number: 1,
          action_by_principal_type: 'buyer',
          action_by_principal_id: null,
        }),
      ]
      expect(bidderAuthoredLatest(timeline, 7, bidder, 'sell_initiated')).toBe(true)
    })

    it('returns false when the latest revision author is "seller" on a sell listing', () => {
      // sell listing → bidder = buyer; seller (owner) acted last → bidder's turn
      const timeline = [
        makeRevision({
          negotiation_id: 7,
          revision_number: 1,
          action_by_principal_type: 'buyer',
          action_by_principal_id: null,
        }),
        makeRevision({
          negotiation_id: 7,
          revision_number: 2,
          action_by_principal_type: 'seller',
          action_by_principal_id: null,
        }),
      ]
      expect(bidderAuthoredLatest(timeline, 7, bidder, 'sell_initiated')).toBe(false)
    })
  })

  describe('remote chains — buy listing (bidder is seller)', () => {
    it('returns true when the latest revision author is "seller" on a buy listing', () => {
      // buy listing → bidder = seller; seller acted last → owner's turn
      const timeline = [
        makeRevision({
          negotiation_id: 7,
          revision_number: 1,
          action_by_principal_type: 'seller',
          action_by_principal_id: null,
        }),
      ]
      expect(bidderAuthoredLatest(timeline, 7, bidder, 'buy_initiated')).toBe(true)
    })

    it('returns false when the latest revision author is "buyer" on a buy listing', () => {
      // buy listing → bidder = seller; buyer (owner) acted last → bidder's turn
      const timeline = [
        makeRevision({
          negotiation_id: 7,
          revision_number: 1,
          action_by_principal_type: 'seller',
          action_by_principal_id: null,
        }),
        makeRevision({
          negotiation_id: 7,
          revision_number: 2,
          action_by_principal_type: 'buyer',
          action_by_principal_id: null,
        }),
      ]
      expect(bidderAuthoredLatest(timeline, 7, bidder, 'buy_initiated')).toBe(false)
    })
  })
})
