export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const TONE_BY_STATUS: Record<string, StatusTone> = {
  // Account / generic
  ACTIVE: 'success',
  active: 'success',
  INACTIVE: 'neutral',
  inactive: 'neutral',
  // Card / loan / payment / order outcomes
  APPROVED: 'success',
  approved: 'success',
  COMPLETED: 'success',
  completed: 'success',
  EXECUTED: 'success',
  executed: 'success',
  PAID: 'success',
  paid: 'success',
  ACCEPTED: 'success',
  ACCEPTEDED: 'success',
  // In-flight
  PENDING: 'warning',
  pending: 'warning',
  PROCESSING: 'warning',
  processing: 'warning',
  WAITING: 'warning',
  waiting: 'warning',
  FILLING: 'warning',
  filling: 'warning',
  PARTIALLY_FILLED: 'warning',
  partially_filled: 'warning',
  IN_PROGRESS: 'warning',
  in_progress: 'warning',
  // Trouble
  BLOCKED: 'danger',
  blocked: 'danger',
  REJECTED: 'danger',
  rejected: 'danger',
  FAILED: 'danger',
  failed: 'danger',
  CANCELLED: 'danger',
  cancelled: 'danger',
  CANCELED: 'danger',
  canceled: 'danger',
  // End-of-life / dim
  DEACTIVATED: 'neutral',
  deactivated: 'neutral',
  EXPIRED: 'neutral',
  expired: 'neutral',
  CLOSED: 'neutral',
  closed: 'neutral',
}

export function statusTone(status: string | null | undefined): StatusTone {
  if (!status) return 'neutral'
  return TONE_BY_STATUS[status] ?? TONE_BY_STATUS[status.toUpperCase()] ?? 'neutral'
}

export const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20',
  info: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20',
  neutral: 'bg-muted text-muted-foreground border border-border/50',
}
