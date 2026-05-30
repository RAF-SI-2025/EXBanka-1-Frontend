import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { RevisionWithChain } from '@/views/otcOptions/hooks/useOtcOptionsLists'
import type { OtcParty } from '@/views/otcOptions/types'

interface Props {
  revisions: RevisionWithChain[]
  /** When provided, revisions authored by this principal render as "You". */
  currentPrincipal?: OtcParty | null
}

function chainBidderLabel(r: RevisionWithChain): string {
  if (r.chain_bidder_name) return r.chain_bidder_name
  if (!r.chain_bidder) return '—'
  return `${r.chain_bidder.owner_type}-${r.chain_bidder.owner_id ?? '?'}`
}

function actorLabel(r: RevisionWithChain, currentPrincipal: OtcParty | null | undefined): string {
  if (
    currentPrincipal &&
    currentPrincipal.owner_type === r.action_by_principal_type &&
    currentPrincipal.owner_id === r.action_by_principal_id
  ) {
    return 'You'
  }
  return `${r.action_by_principal_type}-${r.action_by_principal_id}`
}

export function OfferHistoryTable({ revisions, currentPrincipal }: Props) {
  if (revisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No bid activity yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Bidder</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>By</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Strike</TableHead>
          <TableHead className="text-right">Premium</TableHead>
          <TableHead>Settles</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {revisions.map((r) => (
          <TableRow key={`${r.chain_id}-${r.id}`}>
            <TableCell className="text-xs text-muted-foreground">
              {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
            </TableCell>
            <TableCell className="text-xs">{chainBidderLabel(r)}</TableCell>
            <TableCell className="text-xs uppercase font-medium">{r.action}</TableCell>
            <TableCell className="text-xs">{actorLabel(r, currentPrincipal)}</TableCell>
            <TableCell className="text-right">{r.quantity}</TableCell>
            <TableCell className="text-right">{r.strike_price}</TableCell>
            <TableCell className="text-right">{r.premium ?? '—'}</TableCell>
            <TableCell className="text-xs">{r.settlement_date?.slice(0, 10)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
