import type { OptionContract } from '@/types/otcOption'

// NOTE: This mock represents the POST-normalization shape (nested `buyer` /
// `seller` OtcParty objects, `ticker`, `premium`). The live backend wire
// shape is FLAT (`buyer_owner_type`, `buyer_owner_id`, `premium_paid`, etc.)
// — see RawOptionContract in src/lib/api/otcOption.ts. Use this fixture for
// downstream consumers (components, selectors); raw flat shapes for
// normalizer tests.
export function createMockOptionContract(overrides: Partial<OptionContract> = {}): OptionContract {
  return {
    id: 5001,
    status: 'ACTIVE',
    kind: 'local',
    ticker: 'AAPL',
    quantity: '100',
    strike_price: '5000.00',
    premium: '50000.00',
    settlement_date: '2026-06-05',
    buyer: { owner_type: 'client', owner_id: 7 },
    seller: { owner_type: 'client', owner_id: 8 },
    // Default to the buyer/holder perspective so the exercisable path is the
    // baseline; override with `me_owner: false` to model the seller/writer.
    me_owner: true,
    ...overrides,
  }
}
