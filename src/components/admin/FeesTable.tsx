import type { TransferFee } from '@/types/fee'
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

interface FeesTableProps {
  fees: TransferFee[]
  onEdit: (fee: TransferFee) => void
  onDeactivate: (fee: TransferFee) => void
  onReactivate: (fee: TransferFee) => void
}

export function FeesTable({ fees, onEdit, onDeactivate, onReactivate }: FeesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Min Amount</TableHead>
          <TableHead>Max Fee Cap</TableHead>
          <TableHead>Transaction Type</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fees.map((fee) => (
          <TableRow key={fee.id}>
            <TableCell className="font-medium">{fee.name}</TableCell>
            <TableCell>
              <Badge variant={fee.fee_type === 'percentage' ? 'default' : 'secondary'}>
                {fee.fee_type}
              </Badge>
            </TableCell>
            <TableCell>
              {fee.fee_type === 'percentage' ? `${fee.fee_value}%` : fee.fee_value}
            </TableCell>
            <TableCell>{fee.min_amount || '-'}</TableCell>
            <TableCell>{fee.max_fee || '-'}</TableCell>
            <TableCell>{fee.transaction_type}</TableCell>
            <TableCell>{fee.currency_code || 'All'}</TableCell>
            <TableCell>
              <Badge variant={fee.active ? 'default' : 'secondary'}>
                {fee.active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(fee)}>
                  Edit
                </Button>
                {fee.active ? (
                  <Button variant="destructive" size="sm" onClick={() => onDeactivate(fee)}>
                    Deactivate
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => onReactivate(fee)}>
                    Reactivate
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
