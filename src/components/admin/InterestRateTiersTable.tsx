import type { InterestRateTier } from '@/types/interestRateTiers'
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

interface InterestRateTiersTableProps {
  tiers: InterestRateTier[]
  onEdit: (tier: InterestRateTier) => void
  onDelete: (tier: InterestRateTier) => void
  onApply: (tier: InterestRateTier) => void
}

function formatAmount(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0 })
}

export function InterestRateTiersTable({
  tiers,
  onEdit,
  onDelete,
  onApply,
}: InterestRateTiersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount Range</TableHead>
          <TableHead>Fixed Rate %</TableHead>
          <TableHead>Variable Base %</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tiers.map((tier) => (
          <TableRow key={tier.id}>
            <TableCell>
              {formatAmount(tier.amount_from)} - {formatAmount(tier.amount_to)}
            </TableCell>
            <TableCell>{tier.fixed_rate}%</TableCell>
            <TableCell>{tier.variable_base}%</TableCell>
            <TableCell>
              <Badge variant={tier.active ? 'default' : 'secondary'}>
                {tier.active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(tier)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onApply(tier)}>
                  Apply to Loans
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(tier)}>
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
