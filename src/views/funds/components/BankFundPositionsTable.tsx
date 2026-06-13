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
import type { BankFundPosition } from '@/types/profit'

interface BankFundPositionsTableProps {
  positions: BankFundPosition[]
  onInvest: (position: BankFundPosition) => void
  onRedeem: (position: BankFundPosition) => void
}

export function BankFundPositionsTable({
  positions,
  onInvest,
  onRedeem,
}: BankFundPositionsTableProps) {
  if (positions.length === 0) {
    return <p className="text-muted-foreground">The bank holds no fund positions yet.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fund</TableHead>
          <TableHead>% Fund</TableHead>
          <TableHead>Contributed</TableHead>
          <TableHead>Current value</TableHead>
          <TableHead>Profit</TableHead>
          <TableHead className="w-48 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((p) => (
          <TableRow key={p.fund_id}>
            <TableCell className="font-medium">
              <Link to={`/funds/${p.fund_id}`} className="hover:underline">
                {p.fund_name}
              </Link>
            </TableCell>
            <TableCell>{p.percentage_fund}%</TableCell>
            <TableCell>{p.total_contributed_rsd} RSD</TableCell>
            <TableCell>{p.current_value_rsd} RSD</TableCell>
            <TableCell>{p.profit_rsd} RSD</TableCell>
            <TableCell className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onInvest(p)}>
                Invest
              </Button>
              <Button size="sm" variant="outline" onClick={() => onRedeem(p)}>
                Redeem
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
