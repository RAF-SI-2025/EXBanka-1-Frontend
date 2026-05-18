import type { BankMargin } from '@/types/bankMargins'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BankMarginsTableProps {
  margins: BankMargin[]
  onEdit: (margin: BankMargin) => void
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function BankMarginsTable({ margins, onEdit }: BankMarginsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loan Type</TableHead>
          <TableHead>Margin %</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {margins.map((margin) => (
          <TableRow key={margin.id}>
            <TableCell className="font-medium">{capitalize(margin.loan_type)}</TableCell>
            <TableCell>{margin.margin}%</TableCell>
            <TableCell>
              <Badge variant={margin.active ? 'default' : 'secondary'}>
                {margin.active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(margin.updated_at)}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onEdit(margin)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
