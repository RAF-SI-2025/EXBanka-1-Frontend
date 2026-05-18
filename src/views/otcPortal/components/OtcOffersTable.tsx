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
import type { OtcOffer } from '@/types/otc'
import { hoverLift, rowEnter } from '@/views/shared'

interface Props {
  offers: OtcOffer[]
  onBuy: (offer: OtcOffer) => void
  /** When set, hides the Buy button on listings the current user owns. */
  currentUserId?: number
  /**
   * When true, also treats bank-owned listings as owned by the current user,
   * because every employee acts on behalf of the bank.
   */
  isCurrentUserEmployee?: boolean
}

function offerKey(offer: OtcOffer): string {
  if (offer.kind === 'local') return `local-${offer.id}`
  return `remote-${offer.bank_code}-${offer.owner_id}-${offer.ticker}`
}

function formatPrice(offer: OtcOffer): string {
  if (offer.kind === 'remote' && offer.price_per_unit === '0') {
    return 'Quote on request'
  }
  if (offer.kind === 'remote') {
    return `${offer.price_per_unit} ${offer.currency}`
  }
  return offer.price_per_unit
}

export function OtcOffersTable({ offers, onBuy, currentUserId, isCurrentUserEmployee }: Props) {
  if (offers.length === 0) {
    return <p className="text-muted-foreground">No offers available.</p>
  }

  function isOwnedByViewer(offer: OtcOffer): boolean {
    if (offer.kind !== 'local') return false
    if (isCurrentUserEmployee) {
      if (offer.seller_type === 'bank') return true
      if (
        offer.seller_type === 'employee' &&
        currentUserId !== undefined &&
        offer.seller_id === currentUserId
      ) {
        return true
      }
      return false
    }
    if (currentUserId === undefined) return false
    if (offer.seller_type && offer.seller_type !== 'client') return false
    return offer.seller_id === currentUserId
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {offers.map((offer) => (
          <TableRow key={offerKey(offer)} className={`${hoverLift} ${rowEnter}`}>
            <TableCell className="font-medium">{offer.ticker}</TableCell>
            <TableCell>{offer.kind === 'local' ? offer.name : '—'}</TableCell>
            <TableCell>{offer.security_type}</TableCell>
            <TableCell>
              {offer.kind === 'local' ? (
                <Badge variant="secondary">Local · {offer.bank_code}</Badge>
              ) : (
                <Badge variant="outline">Peer · {offer.bank_code}</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">{offer.quantity}</TableCell>
            <TableCell className="text-right">{formatPrice(offer)}</TableCell>
            <TableCell className="text-right">
              {isOwnedByViewer(offer) ? (
                <span className="text-sm text-muted-foreground italic">Your offer</span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onBuy(offer)}>
                  {offer.kind === 'local' ? 'Buy' : 'Negotiate'}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
