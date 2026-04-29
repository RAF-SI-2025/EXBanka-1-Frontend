import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ActuaryPerformance } from '@/types/profit'

interface ActuaryPerformanceTableProps {
  actuaries: ActuaryPerformance[]
}

export function ActuaryPerformanceTable({ actuaries }: ActuaryPerformanceTableProps) {
  if (actuaries.length === 0) {
    return <p className="text-muted-foreground">No actuary trades recorded yet.</p>
  }
  const sorted = [...actuaries].sort(
    (a, b) => Number(b.realised_profit_rsd) - Number(a.realised_profit_rsd)
  )
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Trades</TableHead>
          <TableHead className="text-right">Realised profit (RSD)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((a) => (
          <TableRow key={a.employee_id}>
            <TableCell className="font-medium">
              {a.first_name} {a.last_name}
            </TableCell>
            <TableCell className="capitalize">{a.position}</TableCell>
            <TableCell>{a.trade_count}</TableCell>
            <TableCell className="text-right">{a.realised_profit_rsd}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
