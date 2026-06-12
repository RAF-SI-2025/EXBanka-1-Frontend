import { Fragment, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Account } from '@/types/account'
import { formatAccountOption } from '@/lib/utils/format'
import type { OtcNegotiationRevision, OtcParty } from '@/views/otcOptions/types'
import { formatActor } from '@/views/otcOptions/lib/actor'

interface AcceptConfig {
  /** Accounts the caller can settle from (the acceptor's strike account). */
  accounts: Account[]
  pending: boolean
  /** Accept the chain with the chosen acceptor account. */
  onAccept: (acceptorAccountId: number) => void
}

interface Props {
  revisions: OtcNegotiationRevision[]
  /** When provided, revisions authored by this principal render as "You". */
  currentPrincipal?: OtcParty
  /**
   * When provided, a seller-authored revision (`action_by_principal_type ===
   * 'seller'`) shows an "Accept" action — the bidder accepting the seller's
   * terms via POST /me/otc/options/:id/negotiations/:nid/accept.
   */
  accept?: AcceptConfig
}

export function NegotiationRevisionsTable({ revisions, currentPrincipal, accept }: Props) {
  const [acceptingId, setAcceptingId] = useState<number | null>(null)

  if (revisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No revisions yet.</p>
  }

  const columnCount = accept ? 9 : 8

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
          {accept && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {revisions.map((r) => {
          const acceptable = accept && r.action_by_principal_type === 'seller'
          return (
            <Fragment key={r.id}>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">{r.revision_number}</TableCell>
                <TableCell className="text-xs uppercase font-medium">{r.action}</TableCell>
                <TableCell className="text-xs">
                  {formatActor(
                    r.action_by_principal_type,
                    r.action_by_principal_id,
                    currentPrincipal
                  )}
                </TableCell>
                <TableCell className="text-right">{r.quantity}</TableCell>
                <TableCell className="text-right">{r.strike_price}</TableCell>
                <TableCell className="text-right">{r.premium ?? '—'}</TableCell>
                <TableCell className="text-xs">{r.settlement_date?.slice(0, 10)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </TableCell>
                {accept && (
                  <TableCell>
                    {acceptable && acceptingId !== r.id && (
                      <Button size="sm" onClick={() => setAcceptingId(r.id)}>
                        Accept
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
              {accept && acceptable && acceptingId === r.id && (
                <AcceptRow
                  revisionId={r.id}
                  accounts={accept.accounts}
                  pending={accept.pending}
                  colSpan={columnCount}
                  onCancel={() => setAcceptingId(null)}
                  onConfirm={(accountId) => accept.onAccept(accountId)}
                />
              )}
            </Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}

function AcceptRow({
  revisionId,
  accounts,
  pending,
  colSpan,
  onCancel,
  onConfirm,
}: {
  revisionId: number
  accounts: Account[]
  pending: boolean
  colSpan: number
  onCancel: () => void
  onConfirm: (acceptorAccountId: number) => void
}) {
  const [accId, setAccId] = useState<string>(accounts[0]?.id?.toString() ?? '')

  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={colSpan}>
        <div className="flex flex-wrap items-end gap-2 py-2">
          <div className="grow min-w-[220px]">
            <Label htmlFor={`accept-acc-${revisionId}`}>Acceptor account</Label>
            <select
              id={`accept-acc-${revisionId}`}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={accId}
              onChange={(e) => setAccId(e.target.value)}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id.toString()}>
                  {formatAccountOption(a)}
                </option>
              ))}
            </select>
          </div>
          <Button
            size="sm"
            disabled={accId === '' || pending}
            onClick={() => accId !== '' && onConfirm(Number(accId))}
          >
            {pending ? 'Accepting…' : 'Confirm accept'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
