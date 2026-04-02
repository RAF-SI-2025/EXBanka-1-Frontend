import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Stock } from '@/types/security'

interface Props {
  securities: Stock[]
  onBuy: (security: Stock) => void
}

export function SecuritiesTable({ securities, onBuy }: Props) {
  if (securities.length === 0) {
    return <p className="text-muted-foreground">No securities available.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead className="text-right">Ask</TableHead>
          <TableHead className="text-right">Bid</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {securities.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">{s.ticker}</TableCell>
            <TableCell>{s.name}</TableCell>
            <TableCell>{s.exchange_acronym}</TableCell>
            <TableCell className="text-right">{s.ask}</TableCell>
            <TableCell className="text-right">{s.bid}</TableCell>
            <TableCell className="text-right">{s.price}</TableCell>
            <TableCell className="text-right">{(s.volume ?? 0).toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" onClick={() => onBuy(s)}>
                Buy
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
