import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OtcOptionRow } from '@/views/otcOptions/types'

interface Props {
  rows: OtcOptionRow[]
  currentBidder: { owner_type: string; owner_id: number | null } | null
  // When true, every row is treated as owned by the caller — used by the
  // "My" tab, which is fed by /me/otc/options (already filtered server-side).
  forceOwn?: boolean
  onBid: (row: OtcOptionRow) => void
  onActivity: (row: OtcOptionRow) => void
}

function isOwnRow(
  row: OtcOptionRow,
  bidder: { owner_type: string; owner_id: number | null } | null
): boolean {
  if (!bidder || bidder.owner_id == null) return false
  const expectedId = String(bidder.owner_id)
  const sid: unknown = row.seller_id
  if (sid == null) return false
  if (typeof sid === 'number') {
    return String(sid) === expectedId
  }
  if (typeof sid === 'string') {
    // Accepts "client-7", "employee-3", or a bare "7".
    const dashIdx = sid.indexOf('-')
    if (dashIdx > 0) {
      return sid.slice(0, dashIdx) === bidder.owner_type && sid.slice(dashIdx + 1) === expectedId
    }
    return sid === expectedId
  }
  if (typeof sid === 'object') {
    const obj = sid as { owner_type?: string; owner_id?: unknown; id?: unknown }
    if (obj.owner_type && obj.owner_type !== bidder.owner_type) return false
    const idCandidate = obj.owner_id ?? obj.id
    return idCandidate != null && String(idCandidate) === expectedId
  }
  return false
}

function fmt(value: string | number | undefined | null, fallback = '—'): string {
  if (value == null || value === '') return fallback
  return String(value)
}

export function OtcOptionsTable({ rows, currentBidder, forceOwn, onBid, onActivity }: Props) {
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
          <TableHead className="text-right">Active chains</TableHead>
          <TableHead>Settles</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const own = forceOwn || isOwnRow(row, currentBidder)
          const bestPrice = row.direction === 'sell_initiated' ? row.best_bid : row.best_ask
          return (
            <TableRow key={`${row.bank_code}-${row.offer_id}`}>
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
                  <Button size="sm" variant="outline" onClick={() => onActivity(row)}>
                    Activity
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => onBid(row)}>
                    Place bid
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
