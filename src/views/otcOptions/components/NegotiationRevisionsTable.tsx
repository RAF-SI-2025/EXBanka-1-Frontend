import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OtcNegotiationRevision, OtcParty } from '@/views/otcOptions/types'
import { formatActor } from '@/views/otcOptions/lib/actor'

interface Props {
  revisions: OtcNegotiationRevision[]
  /** When provided, revisions authored by this principal render as "You". */
  currentPrincipal?: OtcParty
}

export function NegotiationRevisionsTable({ revisions, currentPrincipal }: Props) {
  if (revisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No revisions yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>By</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Strike</TableHead>
          <TableHead className="text-right">Premium</TableHead>
          <TableHead>Settles</TableHead>
          <TableHead>At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {revisions.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="text-xs text-muted-foreground">{r.revision_number}</TableCell>
            <TableCell className="text-xs uppercase font-medium">{r.action}</TableCell>
            <TableCell className="text-xs">
              {formatActor(r.action_by_principal_type, r.action_by_principal_id, currentPrincipal)}
            </TableCell>
            <TableCell className="text-right">{r.quantity}</TableCell>
            <TableCell className="text-right">{r.strike_price}</TableCell>
            <TableCell className="text-right">{r.premium ?? '—'}</TableCell>
            <TableCell className="text-xs">{r.settlement_date?.slice(0, 10)}</TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
