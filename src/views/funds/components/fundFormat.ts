/** Shared formatting + colour helpers for the fund detail surface. */

export function formatRsd(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '— RSD'
  const num = Number(value)
  if (!Number.isFinite(num)) return `${value} RSD`
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatPct(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—%'
  const num = Number(value)
  if (!Number.isFinite(num)) return `${value}%`
  return `${num.toFixed(2)}%`
}

/** Tailwind text-colour class for a signed value: green ≥ 0, red < 0, '' if NaN. */
export function signClass(value: string | null | undefined): string {
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  return num >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
}
