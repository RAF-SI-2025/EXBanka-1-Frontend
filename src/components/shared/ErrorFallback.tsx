import { OctagonXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  message?: string
  onRetry?: () => void
}

export function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <OctagonXIcon className="h-10 w-10 text-destructive" aria-hidden />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        {message ?? 'An unexpected error occurred while rendering this page.'}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
