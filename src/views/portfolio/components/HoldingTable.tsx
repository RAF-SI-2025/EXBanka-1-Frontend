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

interface HoldingTableProps {
  holdings: Holding[]
  onRowClick: (id: number) => void
  onSell: (id: number) => void
  onMakePublic: (id: number) => void
  onExercise: (id: number) => void
}

export function HoldingTable({
  holdings,
  onRowClick,
  onSell,
  onMakePublic,
  onExercise,
}: HoldingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Public Qty</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((holding) => (
          <TableRow
            key={holding.id}
            className="cursor-pointer"
            onClick={() => onRowClick(holding.id)}
          >
            <TableCell className="font-mono font-semibold">{holding.ticker}</TableCell>
            <TableCell>{holding.name}</TableCell>
            <TableCell>{holding.security_type}</TableCell>
            <TableCell>{holding.quantity}</TableCell>
            <TableCell>{holding.public_quantity}</TableCell>
            <TableCell>{holding.account_id}</TableCell>
            <TableCell>{new Date(holding.last_modified).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" onClick={() => onSell(holding.id)}>
                  Sell
                </Button>
                {holding.security_type !== 'option' && (
                  <Button size="sm" variant="outline" onClick={() => onMakePublic(holding.id)}>
                    Make Public
                  </Button>
                )}
                {holding.security_type === 'option' && (
                  <Button size="sm" variant="outline" onClick={() => onExercise(holding.id)}>
                    Exercise
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
