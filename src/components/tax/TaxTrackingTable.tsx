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
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Total Debt (RSD)</TableHead>
          <TableHead>Last Collection</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">
              {r.first_name} {r.last_name}
            </TableCell>
            <TableCell>
              <Badge variant={r.user_type === 'actuary' ? 'default' : 'secondary'}>
                {USER_TYPE_LABEL[r.user_type] ?? r.user_type}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono">{r.unpaid_tax}</TableCell>
            <TableCell>
              {r.last_collection ? new Date(r.last_collection).toLocaleDateString() : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
