import { cn } from '@/lib/utils'

interface Props {
  label?: string
  className?: string
}

export function LoadingState({ label = 'Loading…', className }: Props) {
  return (
    <p
      data-testid="view-loading"
      className={cn('text-sm text-muted-foreground py-8 text-center animate-pulse', className)}
    >
      {label}
    </p>
  )
}
