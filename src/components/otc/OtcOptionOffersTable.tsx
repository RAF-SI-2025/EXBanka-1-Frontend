import { Link, useNavigate } from 'react-router-dom'
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
  /**
   * When true, also treats bank-owned offers (initiator.owner_type === 'bank')
   * as owned by the current user, because any employee/admin acts on behalf
   * of the bank — they manage the bank's incoming bids and cannot bid on the
   * bank's own listings.
   */
  isCurrentUserEmployee?: boolean
  /** Open the place-bid dialog for the given offer. */
  onBid?: (offer: OtcOffer) => void
}

export function OtcOptionOffersTable({
  offers,
  currentUserId,
  isCurrentUserEmployee,
  onBid,
}: Props) {
  const navigate = useNavigate()
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
        {offers.map((o, idx) => {
          // A viewer "owns" an offer when both viewer type AND owner identity
          // line up. Without the type gate, a client and an employee that
          // happen to share an id both get "Your offer" on the same listing.
          const ownerType = o.initiator?.owner_type
          const ownerId = o.initiator?.owner_id
          const isOwner =
            isCurrentUserEmployee === true
              ? // employee/admin: every bank offer, plus their own employee-typed offers
                ownerType === 'bank' ||
                (ownerType === 'employee' &&
                  currentUserId !== undefined &&
                  ownerId === currentUserId)
              : // client: only their own client-typed offers
                ownerType === 'client' &&
                currentUserId !== undefined &&
                ownerId === currentUserId
          const detailUrl = `/otc/offers/${o.id}`
          // Click anywhere on the row (except interactive controls) to open
          // the detail page — owners use this to see their incoming bids.
          const navigateOnClick = () => navigate(detailUrl)
          return (
            <TableRow
              key={`${o.id ?? 'unknown'}-${idx}`}
              className="cursor-pointer hover:bg-muted/40"
              onClick={navigateOnClick}
            >
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
                <DirectionBadge direction={o.direction === 'sell_initiated' ? 'sell' : 'buy'} />
              </TableCell>
              <TableCell className="font-medium">
                <Link
                  to={detailUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline"
                >
                  {o.ticker ?? `#${o.stock_id}`}
                </Link>
              </TableCell>
              <TableCell className="text-right">{o.quantity}</TableCell>
              <TableCell className="text-right">{o.strike_price}</TableCell>
              <TableCell className="text-right">{o.premium ?? '—'}</TableCell>
              <TableCell>{o.settlement_date}</TableCell>
              <TableCell>
                <OtcOptionStatusBadge status={o.status ?? 'open'} />
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
