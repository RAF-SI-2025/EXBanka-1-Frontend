import { inferOrderType, calculateApproxPrice } from '@/lib/utils/trading'

describe('inferOrderType', () => {
  it('returns market when no limit or stop provided', () => {
    expect(inferOrderType()).toBe('market')
  })

  it('returns market when both are empty strings', () => {
    expect(inferOrderType('', '')).toBe('market')
  })

  it('returns limit when only limit value is provided', () => {
    expect(inferOrderType('100.00')).toBe('limit')
  })

  it('returns stop when only stop value is provided', () => {
    expect(inferOrderType(undefined, '90.00')).toBe('stop')
  })

  it('returns stop_limit when both limit and stop values are provided', () => {
    expect(inferOrderType('100.00', '90.00')).toBe('stop_limit')
  })
})

describe('calculateApproxPrice', () => {
  it('uses ask price for market buy order', () => {
    expect(calculateApproxPrice('market', 'buy', '175.50', '175.40', 1, 10)).toBe(1755.0)
  })

  it('uses bid price for market sell order', () => {
    expect(calculateApproxPrice('market', 'sell', '175.50', '175.40', 1, 10)).toBe(1754.0)
  })

  it('uses limit value for limit order', () => {
    expect(calculateApproxPrice('limit', 'buy', '175.50', '175.40', 1, 10, '170.00')).toBe(1700.0)
  })

  it('uses limit value for stop_limit order', () => {
    expect(
      calculateApproxPrice('stop_limit', 'buy', '175.50', '175.40', 1, 10, '170.00', '160.00')
    ).toBe(1700.0)
  })

  it('uses stop value for stop order', () => {
    expect(
      calculateApproxPrice('stop', 'buy', '175.50', '175.40', 1, 10, undefined, '160.00')
    ).toBe(1600.0)
  })

  it('multiplies by contract size', () => {
    expect(calculateApproxPrice('market', 'buy', '4500.00', '4490.00', 50, 2)).toBe(450000)
  })
})
