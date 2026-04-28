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
import type { Fund } from '@/types/fund'

interface FundsTableProps {
  funds: Fund[]
  onInvest: (fund: Fund) => void
}

function formatRsd(value: string): string {
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 2,
  }).format(num)
}

export function FundsTable({ funds, onInvest }: FundsTableProps) {
  if (funds.length === 0) {
    return <p className="text-muted-foreground">No funds available.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Fund value</TableHead>
          <TableHead>Profit</TableHead>
          <TableHead>Min. contribution</TableHead>
          <TableHead className="w-32 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {funds.map((fund) => (
          <TableRow key={fund.id} className={fund.active ? '' : 'opacity-60'}>
            <TableCell className="font-medium">
              <Link to={`/funds/${fund.id}`} className="hover:underline">
                {fund.name}
              </Link>
            </TableCell>
            <TableCell className="max-w-xs truncate" title={fund.description}>
              {fund.description}
            </TableCell>
            <TableCell>{formatRsd(fund.fund_value_rsd)}</TableCell>
            <TableCell>{formatRsd(fund.profit_rsd)}</TableCell>
            <TableCell>{formatRsd(fund.minimum_contribution_rsd)}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInvest(fund)}
                disabled={!fund.active}
              >
                Invest
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
