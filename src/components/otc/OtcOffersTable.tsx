import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { OtcOffer } from '@/types/otc'

interface Props {
  offers: OtcOffer[]
  onBuy: (offer: OtcOffer) => void
}

export function OtcOffersTable({ offers, onBuy }: Props) {
  if (offers.length === 0) {
    return <p className="text-muted-foreground">No offers available.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {offers.map((offer) => (
          <TableRow key={offer.id}>
            <TableCell className="font-medium">{offer.ticker}</TableCell>
            <TableCell>{offer.name}</TableCell>
            <TableCell>{offer.security_type}</TableCell>
            <TableCell className="text-right">{offer.quantity}</TableCell>
            <TableCell className="text-right">{offer.price}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="outline" onClick={() => onBuy(offer)}>
                Buy
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
