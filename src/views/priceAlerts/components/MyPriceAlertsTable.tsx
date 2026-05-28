import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useListingMap } from '@/hooks/useSecurities'
import type { PriceAlert, PriceAlertCondition } from '@/types/priceAlert'

interface MyPriceAlertsTableProps {
  alerts: PriceAlert[]
  onEdit: (alert: PriceAlert) => void
  onPause: (id: number) => void
  onResume: (id: number) => void
  onDelete: (id: number) => void
  /** When set, the row with this id renders its action buttons disabled. */
  busyId?: number
}

const CONDITION_SYMBOL: Record<PriceAlertCondition, string> = {
  gte: '≥',
  lte: '≤',
  daily_change_pct_gte: 'Δ% ≥',
  daily_change_pct_lte: 'Δ% ≤',
}

function formatCondition(alert: PriceAlert): string {
  return `${CONDITION_SYMBOL[alert.condition]} ${alert.threshold}`
}

function formatCooldown(seconds: number): string {
  const hours = seconds / (60 * 60)
  // Show whole hours when the value divides cleanly; otherwise show one decimal.
  return Number.isInteger(hours) ? `Every ${hours}h` : `Every ${hours.toFixed(1)}h`
}

export function MyPriceAlertsTable({
  alerts,
  onEdit,
  onPause,
  onResume,
  onDelete,
  busyId,
}: MyPriceAlertsTableProps) {
  const listingMap = useListingMap()

  if (alerts.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no price alerts yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Condition</TableHead>
          <TableHead>Recurring</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((a) => {
          const busy = busyId === a.id
          const listing = listingMap.get(a.listing_id)
          return (
            <TableRow key={a.id}>
              <TableCell className="font-mono font-semibold">
                {listing?.ticker ?? `#${a.listing_id}`}
              </TableCell>
              <TableCell>{listing?.name ?? '—'}</TableCell>
              <TableCell>{formatCondition(a)}</TableCell>
              <TableCell>
                {a.is_recurring ? formatCooldown(a.cooldown_seconds) : 'Single-shot'}
              </TableCell>
              <TableCell>
                {a.active ? <Badge>Active</Badge> : <Badge variant="secondary">Paused</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(a)} disabled={busy}>
                    Edit
                  </Button>
                  {a.active ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPause(a.id)}
                      disabled={busy}
                    >
                      Pause
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResume(a.id)}
                      disabled={busy}
                    >
                      Resume
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(a.id)}
                    disabled={busy}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
