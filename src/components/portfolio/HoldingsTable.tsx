import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Holding } from '@/types/portfolio'

interface Props {
  holdings: Holding[]
  onSell: (holding: Holding) => void
  onMakePublic: (holding: Holding) => void
  onExercise: (holding: Holding) => void
}

export function HoldingsTable({ holdings, onSell, onMakePublic, onExercise }: Props) {
  if (holdings.length === 0) {
    return <p className="text-muted-foreground">No holdings found.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Public Qty</TableHead>
          <TableHead className="text-right">Account</TableHead>
          <TableHead className="text-right">Last Modified</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((h) => (
          <TableRow key={h.id}>
            <TableCell className="font-medium">{h.ticker}</TableCell>
            <TableCell>{h.name}</TableCell>
            <TableCell>{h.security_type}</TableCell>
            <TableCell className="text-right">{h.quantity}</TableCell>
            <TableCell className="text-right">{h.public_quantity}</TableCell>
            <TableCell className="text-right">{h.account_id}</TableCell>
            <TableCell className="text-right">
              {new Date(h.last_modified).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button size="sm" variant="outline" onClick={() => onSell(h)}>
                Sell
              </Button>
              {h.security_type === 'stock' && (
                <Button size="sm" variant="outline" onClick={() => onMakePublic(h)}>
                  Make Public
                </Button>
              )}
              {h.security_type === 'option' && (
                <Button size="sm" variant="outline" onClick={() => onExercise(h)}>
                  Exercise
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
