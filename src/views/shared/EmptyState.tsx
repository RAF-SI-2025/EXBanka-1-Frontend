import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  title?: ReactNode
  hint?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title = 'Nothing here yet.', hint, action, className }: Props) {
  return (
    <div
      data-testid="view-empty"
      className={cn(
        'py-10 text-center space-y-2 text-muted-foreground animate-in fade-in duration-300',
        className
      )}
    >
      <p className="text-sm">{title}</p>
      {hint != null && <p className="text-xs">{hint}</p>}
      {action != null && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  )
}
