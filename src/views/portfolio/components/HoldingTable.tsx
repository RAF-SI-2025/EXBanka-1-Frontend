import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { SecurityPosition } from '@/types/portfolio'

interface HoldingTableProps {
  positions: SecurityPosition[]
  onRowClick: (holdingId: number) => void
  onSell: (holdingId: number) => void
  onExercise: (holdingId: number) => void
}

export function HoldingTable({ positions, onRowClick, onSell, onExercise }: HoldingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Reserved</TableHead>
          <TableHead className="text-right">Available</TableHead>
          <TableHead className="text-right">Avg Cost</TableHead>
          <TableHead className="text-right">Current Price</TableHead>
          <TableHead className="text-right">Current Value</TableHead>
          <TableHead className="text-right">P&amp;L</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((p) => (
          <TableRow
            key={p.holding_id}
            className="cursor-pointer"
            onClick={() => onRowClick(p.holding_id)}
          >
            <TableCell className="font-mono font-semibold">{p.symbol}</TableCell>
            <TableCell>{p.asset_type}</TableCell>
            <TableCell className="text-right">{p.quantity}</TableCell>
            <TableCell className="text-right">{p.reserved ?? '-'}</TableCell>
            <TableCell className="text-right">{p.available ?? '-'}</TableCell>
            <TableCell className="text-right">{p.avg_cost_rsd}</TableCell>
            <TableCell className="text-right">{p.current_price_rsd}</TableCell>
            <TableCell className="text-right">{p.current_value_rsd}</TableCell>
            <TableCell className="text-right">
              {p.p_l_rsd} ({p.p_l_pct}%)
            </TableCell>
            <TableCell>{new Date(p.last_updated).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" onClick={() => onSell(p.holding_id)}>
                  Sell
                </Button>
                {p.asset_type === 'option' && (
                  <Button size="sm" variant="outline" onClick={() => onExercise(p.holding_id)}>
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
