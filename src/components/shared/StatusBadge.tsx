import { statusTone, TONE_CLASSES, type StatusTone } from '@/lib/utils/statusTone'

interface StatusBadgeProps {
  /**
   * Status string from the backend, used to look up a tone. Optional if
   * `tone` is passed explicitly.
   */
  status?: string | null
  /** Override tone selection (e.g. for non-status pills). */
  tone?: StatusTone
  /** Visible text. Defaults to the status string. */
  children?: React.ReactNode
  className?: string
}

export function StatusBadge({ status, tone, children, className = '' }: StatusBadgeProps) {
  const resolved: StatusTone = tone ?? statusTone(status)
  const text = children ?? status ?? ''
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${TONE_CLASSES[resolved]} ${className}`}
    >
      {text}
    </span>
  )
}
