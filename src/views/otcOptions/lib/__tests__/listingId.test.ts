import { resolveListingId, otcRowKey } from '@/views/otcOptions/lib/listingId'

describe('resolveListingId', () => {
  // The discovery feed addresses each listing by its stable local surrogate
  // `local_id` (spec §47.2). `offer_id` is the hosting bank's native id and is
  // NOT addressable on this bank's routes — for local rows it is often absent.
  it('uses local_id when present (even if offer_id is also set)', () => {
    expect(resolveListingId({ local_id: 17, offer_id: '42' })).toBe(17)
  })

  it('uses local_id for a local row that carries no offer_id', () => {
    expect(resolveListingId({ local_id: 42 })).toBe(42)
  })

  // The live backend surfaces the addressable surrogate as a bare `id` on
  // option rows (spec §47.2 single-offer response, line 8659). When `local_id`
  // is absent, `id` is the next-best addressable id.
  it('uses id when local_id is absent', () => {
    expect(resolveListingId({ id: 42 })).toBe(42)
  })

  it('prefers local_id over id when both are present', () => {
    expect(resolveListingId({ local_id: 17, id: 42 })).toBe(17)
  })

  it('falls back to offer_id when local_id and id are absent (older payloads / fixtures)', () => {
    expect(resolveListingId({ offer_id: '42' })).toBe(42)
  })

  it('returns NaN only when neither id is present', () => {
    expect(Number.isNaN(resolveListingId({}))).toBe(true)
  })
})

describe('otcRowKey', () => {
  // The bug: when the live row has no resolvable id, every row keyed by
  // `bank-resolveListingId` collapsed to `bank-NaN`. Identical sibling keys made
  // React keep stale rows across refetches — options appeared to duplicate on
  // refresh. The positional index guarantees uniqueness regardless.
  it('is unique for rows that share a bank and have no resolvable id', () => {
    expect(otcRowKey({ bank_code: '111' }, 0)).not.toBe(otcRowKey({ bank_code: '111' }, 1))
  })

  it('is unique even for two rows that resolve to the same id (duplicate data)', () => {
    expect(otcRowKey({ bank_code: '111', id: 42 }, 0)).not.toBe(
      otcRowKey({ bank_code: '111', id: 42 }, 1)
    )
  })

  it('includes the resolved listing id so a stable row keeps a stable key', () => {
    expect(otcRowKey({ bank_code: '111', id: 42 }, 0)).toContain('42')
  })
})
