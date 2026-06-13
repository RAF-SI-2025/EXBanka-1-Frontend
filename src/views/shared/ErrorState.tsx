import { cn } from '@/lib/utils'

interface Props {
  message?: string
  className?: string
}

export function ErrorState({ message = 'Something went wrong.', className }: Props) {
  return (
    <p
      data-testid="view-error"
      className={cn('text-sm text-destructive py-8 text-center', className)}
    >
      {message}
    </p>
  )
}
