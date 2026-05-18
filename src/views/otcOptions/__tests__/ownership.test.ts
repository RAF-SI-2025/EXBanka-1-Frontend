import { isOwnRow } from '@/views/otcOptions/lib/ownership'
import type { OtcOptionRow } from '@/views/otcOptions/types'

// Base row used by the employee-bank-ownership cases below. The
// `seller_id` shape is overridden per test.
const baseRow: OtcOptionRow = {
  kind: 'local',
  bank_code: '111',
  routing_number: 111,
  offer_id: '42',
  seller_id: 'bank-3',
  direction: 'sell_initiated',
  ticker: 'AAPL',
  amount: 10,
  strike_price: '175.50',
  strike_currency: 'USD',
  premium: '700.00',
  premium_currency: 'USD',
  settlement_date: '2026-12-31T00:00:00Z',
  created_at: '2026-05-10T14:00:00Z',
}

describe('isOwnRow — employee acting for the bank', () => {
  it('returns true for an employee viewing a local bank-owned row', () => {
    const row: OtcOptionRow = { ...baseRow, kind: 'local', seller_id: 'bank-3' }
    const bidder = { owner_type: 'employee', owner_id: 7 }
    expect(isOwnRow(row, bidder)).toBe(true)
  })

  it('returns true for an employee + local row where seller_id is a nested bank object', () => {
    const row: OtcOptionRow = {
      ...baseRow,
      kind: 'local',
      seller_id: { owner_type: 'bank', id: 3 },
    }
    const bidder = { owner_type: 'employee', owner_id: 7 }
    expect(isOwnRow(row, bidder)).toBe(true)
  })

  it('returns false for an employee viewing a remote bank-owned row (cross-bank)', () => {
    const row: OtcOptionRow = { ...baseRow, kind: 'remote', seller_id: 'bank-3' }
    const bidder = { owner_type: 'employee', owner_id: 7 }
    expect(isOwnRow(row, bidder)).toBe(false)
  })

  it('returns false for a client viewing a local bank-owned row', () => {
    const row: OtcOptionRow = { ...baseRow, kind: 'local', seller_id: 'bank-3' }
    const bidder = { owner_type: 'client', owner_id: 7 }
    expect(isOwnRow(row, bidder)).toBe(false)
  })
})

describe('isOwnRow — existing branches (regression)', () => {
  it('returns true when seller_id is numeric and matches the bidder id', () => {
    const row: OtcOptionRow = { ...baseRow, seller_id: 7 as unknown as string }
    const bidder = { owner_type: 'client', owner_id: 7 }
    expect(isOwnRow(row, bidder)).toBe(true)
  })

  it('returns true when seller_id is a "<owner_type>-<id>" string matching the bidder', () => {
    const row: OtcOptionRow = { ...baseRow, seller_id: 'client-5' }
    const bidder = { owner_type: 'client', owner_id: 5 }
    expect(isOwnRow(row, bidder)).toBe(true)
  })

  it('returns false when no bidder is supplied', () => {
    const row: OtcOptionRow = { ...baseRow, seller_id: 'client-5' }
    expect(isOwnRow(row, null)).toBe(false)
  })
})
