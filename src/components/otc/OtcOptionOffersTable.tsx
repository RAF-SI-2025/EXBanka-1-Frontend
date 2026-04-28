import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OtcOptionStatusBadge } from './OtcOptionStatusBadge'
import type { OtcOffer } from '@/types/otcOption'

interface Props {
  offers: OtcOffer[]
}

export function OtcOptionOffersTable({ offers }: Props) {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {offers.map((o) => (
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
            <TableCell className="font-medium">
              <Link to={`/otc/offers/${o.id}`} className="hover:underline">
                {o.direction === 'sell_initiated' ? 'Sell' : 'Buy'}
              </Link>
            </TableCell>
            <TableCell>#{o.stock_id}</TableCell>
            <TableCell className="text-right">{o.quantity}</TableCell>
            <TableCell className="text-right">{o.strike_price}</TableCell>
            <TableCell className="text-right">{o.premium ?? '—'}</TableCell>
            <TableCell>{o.settlement_date}</TableCell>
            <TableCell>
              <OtcOptionStatusBadge status={o.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
