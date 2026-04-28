import type { OtcOfferStatus, OptionContractStatus } from '@/types/otcOption'

const COLOR: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  REJECTED: 'bg-destructive/15 text-destructive',
  EXPIRED: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  EXERCISED: 'bg-accent-2/15 text-accent-2-foreground',
}

interface OtcOptionStatusBadgeProps {
  status: OtcOfferStatus | OptionContractStatus
}

export function OtcOptionStatusBadge({ status }: OtcOptionStatusBadgeProps) {
  const cls = COLOR[status] ?? 'bg-muted text-muted-foreground'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${cls}`}
    >
      {status}
    </span>
  )
}
