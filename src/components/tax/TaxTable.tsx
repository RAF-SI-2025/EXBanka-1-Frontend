import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TaxRecord } from '@/types/tax'

interface TaxTableProps {
  records: TaxRecord[]
}

export function TaxTable({ records }: TaxTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Taxable Amount</TableHead>
          <TableHead>Tax Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{record.user_name}</TableCell>
            <TableCell>{record.user_email}</TableCell>
            <TableCell>{record.user_type}</TableCell>
            <TableCell>{record.taxable_amount}</TableCell>
            <TableCell>{record.tax_amount}</TableCell>
            <TableCell>{record.status}</TableCell>
            <TableCell>{record.created_at}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
