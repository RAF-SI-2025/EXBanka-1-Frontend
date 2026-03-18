import { todayISO, formatDateDisplay, formatDateLocale } from '@/lib/utils/dateFormatter'

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
