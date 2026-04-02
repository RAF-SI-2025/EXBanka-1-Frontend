export const todayISO = (): string => new Date().toISOString().split('T')[0]

export const formatDateDisplay = (ts: number): string => {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatDateLocale = (ts: number): string => {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString()
}

export const dateToUnixTimestamp = (dateStr: string): number => {
  if (!dateStr) return 0
  return Math.floor(new Date(dateStr).getTime() / 1000)
}
