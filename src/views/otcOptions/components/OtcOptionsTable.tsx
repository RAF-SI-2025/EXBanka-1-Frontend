import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { hasOwnNegotiationChain } from '@/views/otcOptions/lib/myNegotiation'
import type { OtcOptionRow } from '@/views/otcOptions/types'
import { hoverLift, rowEnter } from '@/views/shared'

interface Props {
  rows: OtcOptionRow[]
  // When true, every row is treated as owned by the caller — used by the
  // "My" tab, which is fed by /me/otc/options (already filtered server-side).
  forceOwn?: boolean
  onBid: (row: OtcOptionRow) => void
  onActivity: (row: OtcOptionRow) => void
  // Called when the row body (anything outside the inline action button) is
  // clicked. Used to open the per-row activity view for both owners and
  // bidders. Inline button clicks stopPropagation so they don't trigger this.
  onRowOpen: (row: OtcOptionRow) => void
}

function fmt(value: string | number | undefined | null, fallback = '—'): string {
  if (value == null || value === '') return fallback
  return String(value)
}

export function OtcOptionsTable({ rows, forceOwn, onBid, onActivity, onRowOpen }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No offers found.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Strike</TableHead>
          <TableHead className="text-right">Premium</TableHead>
          <TableHead className="text-right">Best Bid / Ask</TableHead>
          <TableHead className="text-right">Bidders</TableHead>
          <TableHead>Settles</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          // The backend tells us directly: `me_owner` ⇒ the caller posted this
          // listing (Activity); otherwise `my_negotiation_id` being a real
          // (numeric) id means a bid chain is already underway (Counter) vs not
          // (Bid). See spec §47.2 and hasOwnNegotiationChain.
          const own = forceOwn || row.me_owner === true
          const hasBid = !own && hasOwnNegotiationChain(row.my_negotiation_id)
          const bestPrice = row.direction === 'sell_initiated' ? row.best_bid : row.best_ask
          return (
            <TableRow
              key={`${row.bank_code}-${row.offer_id}`}
              onClick={() => onRowOpen(row)}
              className={`${hoverLift} ${rowEnter}`}
            >
              <TableCell className="font-medium">{row.ticker}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {row.direction === 'sell_initiated' ? 'SELL' : 'BUY'}
              </TableCell>
              <TableCell className="text-right">{fmt(row.amount)}</TableCell>
              <TableCell className="text-right">
                {row.strike_price} {row.strike_currency}
              </TableCell>
              <TableCell className="text-right">
                {row.premium} {row.premium_currency}
              </TableCell>
              <TableCell className="text-right">{fmt(bestPrice)}</TableCell>
              <TableCell className="text-right">{fmt(row.active_chains_count, '0')}</TableCell>
              <TableCell className="text-xs">
                {row.settlement_date ? row.settlement_date.slice(0, 10) : '—'}
              </TableCell>
              <TableCell className="text-xs">
                {row.kind === 'remote' ? `bank ${row.bank_code}` : 'local'}
              </TableCell>
              <TableCell className="text-right">
                {own ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onActivity(row)
                    }}
                  >
                    Activity
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={hasBid ? 'secondary' : 'default'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onBid(row)
                    }}
                  >
                    {hasBid ? 'Counter' : 'Bid'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
