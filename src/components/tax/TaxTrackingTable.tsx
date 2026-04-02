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
          <TableHead className="text-right">Unpaid Tax (RSD)</TableHead>
          <TableHead className="text-right">Paid YTD (RSD)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">
              {r.first_name} {r.last_name}
            </TableCell>
            <TableCell>{r.email}</TableCell>
            <TableCell>
              <Badge variant={r.user_type === 'actuary' ? 'default' : 'secondary'}>
                {r.user_type}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{r.unpaid_tax}</TableCell>
            <TableCell className="text-right">{r.paid_tax_ytd}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
