import {
  todayISO,
  formatDateDisplay,
  formatDateLocale,
  dateToUnixTimestamp,
} from '@/lib/utils/dateFormatter'

describe('todayISO', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("matches today's date", () => {
    const today = new Date().toISOString().split('T')[0]
    expect(todayISO()).toBe(today)
  })
})

describe('formatDateDisplay', () => {
  it('returns empty string for zero timestamp', () => {
    expect(formatDateDisplay(0)).toBe('')
  })

  it('formats timestamp as dd/mm/yyyy', () => {
    // 2000-01-01 00:00:00 UTC = 946684800
    expect(formatDateDisplay(946684800)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})

describe('formatDateLocale', () => {
  it('returns em dash for zero timestamp', () => {
    expect(formatDateLocale(0)).toBe('—')
  })

  it('returns a non-empty string for a valid timestamp', () => {
    expect(formatDateLocale(946684800)).toBeTruthy()
    expect(formatDateLocale(946684800)).not.toBe('—')
  })
})

describe('dateToUnixTimestamp', () => {
  it('returns 0 for empty string', () => {
    expect(dateToUnixTimestamp('')).toBe(0)
  })

  it('converts YYYY-MM-DD to Unix timestamp in seconds', () => {
    // 2000-01-01 UTC = 946684800
    expect(dateToUnixTimestamp('2000-01-01')).toBe(946684800)
  })

  it('returns a positive integer for a valid date', () => {
    const ts = dateToUnixTimestamp('1990-05-15')
    expect(ts).toBeGreaterThan(0)
    expect(Number.isInteger(ts)).toBe(true)
  })
})
