import { AlertTriangle } from 'lucide-react'

interface Props {
  partial: boolean
  peersTotal: number
  peersReached: number
  lastRefresh: string
}

export function OtcPeersStatusBanner({ partial, peersTotal, peersReached, lastRefresh }: Props) {
  const refreshLabel = lastRefresh
    ? `Last refreshed ${new Date(lastRefresh).toLocaleString()}`
    : 'Awaiting first peer refresh…'

  if (partial) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-100"
      >
        <AlertTriangle className="size-4 mt-0.5" aria-hidden />
        <div>
          <p className="font-medium">
            Showing offers from {peersReached} of {peersTotal} banks
          </p>
          <p className="text-xs opacity-80">
            {peersTotal - peersReached} peer{peersTotal - peersReached === 1 ? '' : 's'} unreachable
            — list is incomplete. {refreshLabel}.
          </p>
        </div>
      </div>
    )
  }

  return <p className="text-xs text-muted-foreground">{refreshLabel}.</p>
}
