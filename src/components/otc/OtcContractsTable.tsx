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
import type { OptionContract } from '@/types/otcOption'

interface Props {
  contracts: OptionContract[]
}

export function OtcContractsTable({ contracts }: Props) {
  if (contracts.length === 0) {
    return <p className="text-muted-foreground">No contracts in this view.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contract</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Strike</TableHead>
          <TableHead className="text-right">Premium</TableHead>
          <TableHead>Settlement</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">
              <Link to={`/otc/contracts/${c.id}`} className="hover:underline">
                #{c.id}
              </Link>
            </TableCell>
            <TableCell>#{c.stock_id}</TableCell>
            <TableCell className="text-right">{c.quantity}</TableCell>
            <TableCell className="text-right">{c.strike_price}</TableCell>
            <TableCell className="text-right">{c.premium}</TableCell>
            <TableCell>{c.settlement_date}</TableCell>
            <TableCell>
              <OtcOptionStatusBadge status={c.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
