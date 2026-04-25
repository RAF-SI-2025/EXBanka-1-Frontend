import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { TaxRecord } from '@/types/tax'

const USER_TYPE_LABEL: Record<string, string> = {
  client: 'Client',
  actuary: 'Actuary',
}

interface TaxTableProps {
  records: TaxRecord[]
}

export function TaxTable({ records }: TaxTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Total Debt (RSD)</TableHead>
          <TableHead>Last Collection</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="font-medium">
              {record.first_name} {record.last_name}
            </TableCell>
            <TableCell>
              <Badge variant={record.user_type === 'actuary' ? 'default' : 'secondary'}>
                {USER_TYPE_LABEL[record.user_type] ?? record.user_type}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono">{record.unpaid_tax}</TableCell>
            <TableCell>
              {record.last_collection ? new Date(record.last_collection).toLocaleDateString() : '—'}
            </TableCell>
          </TableRow>
        ))}
        {records.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No tax records found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
