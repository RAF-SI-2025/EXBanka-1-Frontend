import { maskCardNumber, formatAccountOption } from './format'

describe('formatAccountOption', () => {
  it('shows name, full account number and currency', () => {
    expect(
      formatAccountOption({
        account_name: 'Main',
        account_number: '265000000000123423',
        currency_code: 'USD',
      })
    ).toBe('Main · 265-0000000001234-23 (USD)')
  })

  it('falls back to the account number when the name is blank (never shows just an id)', () => {
    expect(
      formatAccountOption({ account_name: '', account_number: '111222333', currency_code: 'EUR' })
    ).toBe('111222333 (EUR)')
  })

  it('omits the currency when it is missing', () => {
    expect(
      formatAccountOption({ account_name: 'Savings', account_number: '999', currency_code: '' })
    ).toBe('Savings · 999')
  })
})

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
