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
import type { OptionContract } from '@/types/otcOption'

interface Props {
  contracts: OptionContract[]
  onExercise: (contract: OptionContract) => void
  // Caller-provided predicate. Table stays presentational — it does not
  // compute buyer-ness itself. Exercise button only shows for ACTIVE rows
  // where this returns true.
  isBuyer: (contract: OptionContract) => boolean
}

export function OtcContractsTable({ contracts, onExercise, isBuyer }: Props) {
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
          <TableHead className="text-right">Actions</TableHead>
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
            <TableCell className="text-right">
              {c.status === 'ACTIVE' && isBuyer(c) ? (
                <Button size="sm" onClick={() => onExercise(c)}>
                  Exercise
                </Button>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
