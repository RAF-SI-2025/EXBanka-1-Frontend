import { dedupeOffers, offerRowKey } from '@/views/otcPortal/lib/offerKey'
import { createMockOtcOffer, createMockRemoteOtcOffer } from '@/__tests__/fixtures/otc-fixtures'

describe('offerRowKey', () => {
  it('is unique for two local offers that resolve to the same (missing) id', () => {
    const a = createMockOtcOffer({ id: undefined as unknown as number })
    const b = createMockOtcOffer({ id: undefined as unknown as number })
    expect(offerRowKey(a, 0)).not.toBe(offerRowKey(b, 1))
  })
})

describe('dedupeOffers', () => {
  it('collapses entries that are identical in every field', () => {
    const offer = createMockOtcOffer({ id: 1, ticker: 'AAPL' })
    expect(dedupeOffers([offer, { ...offer }])).toHaveLength(1)
  })

  it('keeps offers that differ in any field', () => {
    const a = createMockOtcOffer({ id: 1, ticker: 'AAPL' })
    const b = createMockOtcOffer({ id: 2, ticker: 'AAPL' })
    expect(dedupeOffers([a, b])).toHaveLength(2)
  })

  it('keeps a view-only remote stock and a biddable remote option as distinct', () => {
    const stock = createMockRemoteOtcOffer({ id: undefined, ticker: 'IBM' })
    const option = createMockRemoteOtcOffer({ id: 17, ticker: 'IBM' })
    expect(dedupeOffers([stock, option])).toHaveLength(2)
  })

  it('preserves first-seen order', () => {
    const a = createMockOtcOffer({ id: 1, ticker: 'AAPL' })
    const b = createMockOtcOffer({ id: 2, ticker: 'MSFT' })
    expect(dedupeOffers([a, b, { ...a }]).map((o) => o.kind === 'local' && o.ticker)).toEqual([
      'AAPL',
      'MSFT',
    ])
  })
})
