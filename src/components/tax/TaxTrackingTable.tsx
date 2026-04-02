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

interface Props {
  records: TaxRecord[]
}

export function TaxTrackingTable({ records }: Props) {
  if (records.length === 0) {
    return <p className="text-muted-foreground">No records found.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Tax Amount (RSD)</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.user_name}</TableCell>
            <TableCell>{r.user_email}</TableCell>
            <TableCell>
              <Badge variant={r.user_type === 'actuary' ? 'default' : 'secondary'}>
                {r.user_type}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{r.tax_amount}</TableCell>
            <TableCell>{r.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
