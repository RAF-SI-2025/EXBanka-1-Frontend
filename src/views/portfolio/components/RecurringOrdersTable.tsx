import { useState } from 'react'
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
import { CancelRecurringOrderDialog } from '@/views/portfolio/components/CancelRecurringOrderDialog'
import type { RecurringOrder, RecurringOrderStatus } from '@/types/recurringOrder'

interface RecurringOrdersTableProps {
  orders: RecurringOrder[]
  onPause: (id: number) => void
  onResume: (id: number) => void
  onCancel: (id: number) => void
  /** When set, the row with this id renders its action buttons disabled. */
  busyId?: number
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatFrequency(o: RecurringOrder): string {
  if (o.interval === 'weekly') {
    const day = o.day_of_week != null ? WEEKDAYS[o.day_of_week] : ''
    return day ? `Weekly · ${day}` : 'Weekly'
  }
  return o.day_of_month != null ? `Monthly · day ${o.day_of_month}` : 'Monthly'
}

function StatusBadge({ status }: { status: RecurringOrderStatus }) {
  if (status === 'active') return <Badge>Active</Badge>
  if (status === 'paused') return <Badge variant="secondary">Paused</Badge>
  return <Badge variant="outline">Cancelled</Badge>
}

export function RecurringOrdersTable({
  orders,
  onPause,
  onResume,
  onCancel,
  busyId,
}: RecurringOrdersTableProps) {
  const listingMap = useListingMap()
  const [cancelId, setCancelId] = useState<number | null>(null)

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You have no recurring orders. Schedule one from a security's order page.
      </p>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Security</TableHead>
            <TableHead>Side</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => {
            const busy = busyId === o.id
            const listing = listingMap.get(o.listing_id)
            return (
              <TableRow key={o.id}>
                <TableCell className="font-mono font-semibold">
                  {listing?.ticker ?? `#${o.listing_id}`}
                </TableCell>
                <TableCell className="capitalize">{o.side}</TableCell>
                <TableCell className="text-right">{o.quantity}</TableCell>
                <TableCell>{formatFrequency(o)}</TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {o.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPause(o.id)}
                        disabled={busy}
                      >
                        Pause
                      </Button>
                    )}
                    {o.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResume(o.id)}
                        disabled={busy}
                      >
                        Resume
                      </Button>
                    )}
                    {o.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setCancelId(o.id)}
                        disabled={busy}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <CancelRecurringOrderDialog
        open={cancelId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelId(null)
        }}
        loading={cancelId !== null && busyId === cancelId}
        onConfirm={() => {
          if (cancelId !== null) onCancel(cancelId)
          setCancelId(null)
        }}
      />
    </>
  )
}
