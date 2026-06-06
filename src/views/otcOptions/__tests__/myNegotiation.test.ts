import { hasOwnNegotiationChain } from '@/views/otcOptions/lib/myNegotiation'

describe('hasOwnNegotiationChain', () => {
  it('returns true for a positive numeric id (chain already started)', () => {
    expect(hasOwnNegotiationChain(88)).toBe(true)
  })

  it('returns true for a numeric string id', () => {
    expect(hasOwnNegotiationChain('88')).toBe(true)
  })

  it('returns false when omitted (no chain yet)', () => {
    expect(hasOwnNegotiationChain(undefined)).toBe(false)
    expect(hasOwnNegotiationChain(null)).toBe(false)
  })

  it('treats the 0 sentinel as no chain', () => {
    expect(hasOwnNegotiationChain(0)).toBe(false)
    expect(hasOwnNegotiationChain('0')).toBe(false)
  })

  it('returns false for a non-numeric value', () => {
    expect(hasOwnNegotiationChain('')).toBe(false)
    expect(hasOwnNegotiationChain('abc')).toBe(false)
  })
})
