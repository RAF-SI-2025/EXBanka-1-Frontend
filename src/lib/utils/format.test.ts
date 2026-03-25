import { maskCardNumber } from './format'

describe('maskCardNumber', () => {
  it('masks 16-digit card with spaced format', () => {
    expect(maskCardNumber('4111111111111111')).toBe('4111 **** **** 1111')
  })

  it('masks 15-digit AMEX card', () => {
    expect(maskCardNumber('341111111111111')).toBe('3411 **** *** 1111')
  })

  it('returns short numbers as-is', () => {
    expect(maskCardNumber('1234567')).toBe('1234567')
  })
})
