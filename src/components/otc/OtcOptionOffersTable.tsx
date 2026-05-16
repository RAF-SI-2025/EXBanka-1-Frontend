import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { OtcOptionStatusBadge } from './OtcOptionStatusBadge'
import { DirectionBadge } from '@/components/shared/DirectionBadge'
import type { OtcOffer } from '@/types/otcOption'

interface Props {
  offers: OtcOffer[]
  /** When set, hides the Bid button on offers initiated by the current user. */
  currentUserId?: number
  /** Open the place-bid dialog for the given offer. */
  onBid?: (offer: OtcOffer) => void
}

export function OtcOptionOffersTable({ offers, currentUserId, onBid }: Props) {
  if (offers.length === 0) {
    return <p className="text-muted-foreground">No offers in this view.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Strike</TableHead>
          <TableHead className="text-right">Premium</TableHead>
          <TableHead>Settlement</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {offers.map((o) => {
          const isOwner =
            currentUserId !== undefined && o.initiator?.owner_id === currentUserId
          return (
            <TableRow key={o.id} className="cursor-pointer">
              <TableCell>
                {o.unread && (
                  <span
                    data-testid={`unread-${o.id}`}
                    className="inline-block h-2 w-2 rounded-full bg-accent-2"
                    aria-label="Unread"
                  />
                )}
              </TableCell>
              <TableCell>
                <Link to={`/otc/offers/${o.id}`}>
                  <DirectionBadge direction={o.direction === 'sell_initiated' ? 'sell' : 'buy'} />
                </Link>
              </TableCell>
              <TableCell className="font-medium">{o.ticker ?? `#${o.stock_id}`}</TableCell>
              <TableCell className="text-right">{o.quantity}</TableCell>
              <TableCell className="text-right">{o.strike_price}</TableCell>
              <TableCell className="text-right">{o.premium ?? '—'}</TableCell>
              <TableCell>{o.settlement_date}</TableCell>
              <TableCell>
                <OtcOptionStatusBadge status={o.status ?? 'open'} />
              </TableCell>
              <TableCell className="text-right">
                {isOwner ? (
                  <span className="text-sm text-muted-foreground italic">Your offer</span>
                ) : onBid ? (
                  <Button size="sm" variant="outline" onClick={() => onBid(o)}>
                    Bid
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
