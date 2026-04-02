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
  onMakePublic: (id: number) => void
  onExercise: (id: number) => void
}

export function HoldingTable({ holdings, onMakePublic, onExercise }: HoldingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Avg Price</TableHead>
          <TableHead>Current</TableHead>
          <TableHead>P&L</TableHead>
          <TableHead>P&L%</TableHead>
          <TableHead>Public</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((holding) => (
          <TableRow key={holding.id}>
            <TableCell className="font-mono font-semibold">{holding.ticker}</TableCell>
            <TableCell>{holding.security_name}</TableCell>
            <TableCell>{holding.security_type}</TableCell>
            <TableCell>{holding.quantity}</TableCell>
            <TableCell>{holding.average_price}</TableCell>
            <TableCell>{holding.current_price}</TableCell>
            <TableCell
              className={Number(holding.profit_loss) >= 0 ? 'text-green-600' : 'text-red-600'}
            >
              {holding.profit_loss}
            </TableCell>
            <TableCell>{holding.profit_loss_percent}%</TableCell>
            <TableCell>{holding.is_public ? `${holding.public_quantity}` : 'No'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {!holding.is_public && (
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
