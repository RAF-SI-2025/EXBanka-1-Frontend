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
      className={`inline-flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-medium tracking-wide ${TONE_CLASSES[resolved]} ${className}`}
    >
      {text}
    </span>
  )
}
