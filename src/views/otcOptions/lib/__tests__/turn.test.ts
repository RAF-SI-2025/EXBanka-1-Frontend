import {
  bidderMovedLast,
  isCallerTurn,
  isOwnerTurn,
  partiesMatch,
} from '@/views/otcOptions/lib/turn'
import type { OtcNegotiation, OtcParty } from '@/views/otcOptions/types'

const bidder: OtcParty = { owner_type: 'client', owner_id: 1 }
const owner: OtcParty = { owner_type: 'bank', owner_id: null }

function neg(overrides: Partial<OtcNegotiation> = {}): OtcNegotiation {
  return {
    id: 1,
    status: 'countered',
    bidder,
    quantity: '5',
    strike_price: '100',
    premium: '10',
    settlement_date: '2027-01-01',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    viewer_role: '',
    last_action_mine: false,
    awaiting_viewer: false,
    can_accept: false,
    can_counter: false,
    can_reject: false,
    can_withdraw: false,
    ...overrides,
  }
}

describe('partiesMatch', () => {
  it('matches on owner_type + owner_id', () => {
    expect(partiesMatch(bidder, { owner_type: 'client', owner_id: 1 })).toBe(true)
    expect(partiesMatch(bidder, { owner_type: 'client', owner_id: 2 })).toBe(false)
    expect(partiesMatch(bidder, { owner_type: 'employee', owner_id: 1 })).toBe(false)
    expect(partiesMatch(owner, { owner_type: 'bank', owner_id: null })).toBe(true)
  })
})

describe('bidderMovedLast', () => {
  it('is true when last_action_by is the bidder', () => {
    expect(bidderMovedLast(neg({ last_action_by: bidder }))).toBe(true)
  })
  it('is false when last_action_by is the owner', () => {
    expect(bidderMovedLast(neg({ last_action_by: owner }))).toBe(false)
  })
  it('is null when last_action_by or bidder is missing', () => {
    expect(bidderMovedLast(neg({ last_action_by: undefined }))).toBeNull()
    expect(bidderMovedLast({ last_action_by: bidder } as OtcNegotiation)).toBeNull()
  })
})

describe('isOwnerTurn', () => {
  it('is the owner’s turn when the bidder moved last', () => {
    expect(isOwnerTurn(neg({ last_action_by: bidder }))).toBe(true)
  })
  it('is NOT the owner’s turn when the owner moved last', () => {
    expect(isOwnerTurn(neg({ last_action_by: owner }))).toBe(false)
  })
  it('allows (true) when turn cannot be determined', () => {
    expect(isOwnerTurn(neg({ last_action_by: undefined }))).toBe(true)
  })
})

describe('isCallerTurn', () => {
  it('is the caller’s turn when the other side moved last', () => {
    expect(isCallerTurn(neg({ last_action_by: owner }), bidder)).toBe(true)
  })
  it('is NOT the caller’s turn when the caller moved last', () => {
    expect(isCallerTurn(neg({ last_action_by: bidder }), bidder)).toBe(false)
  })
  it('allows (true) when last_action_by is missing', () => {
    expect(isCallerTurn(neg({ last_action_by: undefined }), bidder)).toBe(true)
  })
})
