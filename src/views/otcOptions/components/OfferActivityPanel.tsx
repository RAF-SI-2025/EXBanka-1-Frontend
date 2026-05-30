import { Fragment, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Account } from '@/types/account'
import type {
  OtcNegotiation,
  OtcOptionRow,
  OtcParty,
  CounterNegotiationPayload,
} from '@/views/otcOptions/types'
import {
  useAcceptNegotiation,
  useCancelOtcOption,
  useCounterNegotiation,
  useRejectNegotiation,
} from '@/views/otcOptions/hooks/useOtcOptionMutations'
import {
  useAllOfferRevisions,
  useOtcNegotiationRevisions,
  useOtcOptionNegotiations,
} from '@/views/otcOptions/hooks/useOtcOptionsLists'
import { NegotiationRevisionsTable } from '@/views/otcOptions/components/NegotiationRevisionsTable'
import { OfferHistoryTable } from '@/views/otcOptions/components/OfferHistoryTable'

interface Props {
  offer: OtcOptionRow
  accounts: Account[]
  /** Caller's identity — used to render their own revisions as "You". */
  currentPrincipal?: OtcParty | null
  onBack: () => void
}

export function OfferActivityPanel({ offer, accounts, currentPrincipal, onBack }: Props) {
  const offerId = Number(offer.offer_id)
  // Bidders table renders the current-state-per-chain snapshot directly from
  // the listing-scoped /otc/options/:id/negotiations response.
  const { data, isLoading, error } = useOtcOptionNegotiations(offerId)
  const accept = useAcceptNegotiation(offerId)
  const reject = useRejectNegotiation(offerId)
  const counter = useCounterNegotiation(offerId)
  const cancelListing = useCancelOtcOption()

  const [counteringId, setCounteringId] = useState<number | null>(null)
  const [acceptingId, setAcceptingId] = useState<number | null>(null)
  const [historyChain, setHistoryChain] = useState<OtcNegotiation | null>(null)

  const negotiations = data?.negotiations ?? []

  // History table fans out one /me/otc/options/negotiations/:nid/revisions
  // call per chain (in parallel), then flattens and sorts by created_at so
  // the owner sees every bid/counter/accept/reject event in one timeline,
  // not just the latest per chain.
  const revisionsQ = useAllOfferRevisions(negotiations)

  const handleAccept = (neg: OtcNegotiation, acceptorAccountId: number) => {
    accept.mutate(
      { negotiationId: neg.id, payload: { acceptor_account_id: acceptorAccountId } },
      { onSettled: () => setAcceptingId(null) }
    )
  }

  const handleCounter = (neg: OtcNegotiation, payload: CounterNegotiationPayload) => {
    counter.mutate({ negotiationId: neg.id, payload }, { onSettled: () => setCounteringId(null) })
  }

  const handleCancelListing = () => {
    cancelListing.mutate(offerId, { onSuccess: onBack })
  }

  if (historyChain) {
    return (
      <ChainRevisionsView
        offer={offer}
        chain={historyChain}
        currentPrincipal={currentPrincipal ?? undefined}
        onBack={() => setHistoryChain(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {offer.ticker} · #{String(offer.offer_id)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {offer.direction === 'sell_initiated' ? 'Sell listing' : 'Buy listing'} ·{' '}
              {offer.amount} @ {offer.strike_price} {offer.strike_currency} · premium{' '}
              {offer.premium} {offer.premium_currency} · settles{' '}
              {offer.settlement_date?.slice(0, 10)}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancelListing}
          disabled={cancelListing.isPending}
        >
          {cancelListing.isPending ? 'Cancelling…' : 'Cancel listing'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bidders ({negotiations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {error && <p className="text-sm text-destructive">Could not load chains.</p>}
          {!isLoading && !error && negotiations.length === 0 && (
            <p className="text-sm text-muted-foreground">No bids yet.</p>
          )}
          {!isLoading && !error && negotiations.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bidder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Strike</TableHead>
                  <TableHead className="text-right">Premium</TableHead>
                  <TableHead>Settles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {negotiations.map((neg) => {
                  const isActive = neg.status === 'open' || neg.status === 'countered'
                  return (
                    <Fragment key={neg.id}>
                      <TableRow>
                        <TableCell className="text-xs">
                          {neg.bidder_name ??
                            (neg.bidder
                              ? `${neg.bidder.owner_type}-${neg.bidder.owner_id ?? '?'}`
                              : '—')}
                        </TableCell>
                        <TableCell className="text-xs uppercase">{neg.status}</TableCell>
                        <TableCell className="text-right">{neg.quantity}</TableCell>
                        <TableCell className="text-right">{neg.strike_price}</TableCell>
                        <TableCell className="text-right">{neg.premium ?? '—'}</TableCell>
                        <TableCell className="text-xs">
                          {neg.settlement_date?.slice(0, 10)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <Button size="sm" variant="ghost" onClick={() => setHistoryChain(neg)}>
                              See history
                            </Button>
                            {isActive && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => setAcceptingId(neg.id)}
                                  disabled={accept.isPending}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCounteringId(neg.id)}
                                  disabled={counter.isPending}
                                >
                                  Counter
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => reject.mutate(neg.id)}
                                  disabled={reject.isPending}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {acceptingId === neg.id && (
                        <AcceptRow
                          neg={neg}
                          accounts={accounts}
                          onCancel={() => setAcceptingId(null)}
                          onConfirm={(accId) => handleAccept(neg, accId)}
                          submitting={accept.isPending}
                        />
                      )}
                      {counteringId === neg.id && (
                        <CounterRow
                          neg={neg}
                          onCancel={() => setCounteringId(null)}
                          onConfirm={(payload) => handleCounter(neg, payload)}
                          submitting={counter.isPending}
                        />
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History ({revisionsQ.revisions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {revisionsQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!!revisionsQ.error && (
            <p className="text-sm text-destructive">Could not load bid history.</p>
          )}
          {!revisionsQ.isLoading && !revisionsQ.error && (
            <OfferHistoryTable
              revisions={revisionsQ.revisions}
              currentPrincipal={currentPrincipal}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ChainRevisionsView({
  offer,
  chain,
  currentPrincipal,
  onBack,
}: {
  offer: OtcOptionRow
  chain: OtcNegotiation
  currentPrincipal?: OtcParty
  onBack: () => void
}) {
  const { data, isLoading, error } = useOtcNegotiationRevisions(chain.id)
  const bidderLabel =
    chain.bidder_name ??
    (chain.bidder ? `${chain.bidder.owner_type}-${chain.bidder.owner_id ?? '?'}` : '—')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold truncate">
            {offer.ticker} · chain #{chain.id}
          </h2>
          <p className="text-xs text-muted-foreground">Bidder: {bidderLabel}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revision history</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {error && <p className="text-sm text-destructive">Could not load revisions.</p>}
          {!isLoading && !error && (
            <NegotiationRevisionsTable
              revisions={data?.revisions ?? []}
              currentPrincipal={currentPrincipal}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AcceptRow({
  neg,
  accounts,
  onCancel,
  onConfirm,
  submitting,
}: {
  neg: OtcNegotiation
  accounts: Account[]
  onCancel: () => void
  onConfirm: (accountId: number) => void
  submitting: boolean
}) {
  const [accId, setAccId] = useState<number | undefined>(accounts[0]?.id)
  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={7}>
        <div className="flex flex-wrap items-end gap-2 py-2">
          <div className="grow min-w-[220px]">
            <Label htmlFor={`accept-acc-${neg.id}`}>Settlement account</Label>
            <Select value={accId?.toString() ?? ''} onValueChange={(v) => setAccId(Number(v))}>
              <SelectTrigger id={`accept-acc-${neg.id}`} className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.account_name} ({a.currency_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            disabled={accId == null || submitting}
            onClick={() => accId != null && onConfirm(accId)}
          >
            {submitting ? 'Accepting…' : 'Confirm accept'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function CounterRow({
  neg,
  onCancel,
  onConfirm,
  submitting,
}: {
  neg: OtcNegotiation
  onCancel: () => void
  onConfirm: (payload: CounterNegotiationPayload) => void
  submitting: boolean
}) {
  const [qty, setQty] = useState(neg.quantity)
  const [strike, setStrike] = useState(neg.strike_price)
  const [premium, setPremium] = useState(neg.premium ?? '')
  const [settle, setSettle] = useState(neg.settlement_date?.slice(0, 10) ?? '')
  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={7}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 py-2 items-end">
          <div>
            <Label htmlFor={`c-qty-${neg.id}`}>Qty</Label>
            <Input id={`c-qty-${neg.id}`} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={`c-strike-${neg.id}`}>Strike</Label>
            <Input
              id={`c-strike-${neg.id}`}
              value={strike}
              onChange={(e) => setStrike(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`c-prem-${neg.id}`}>Premium</Label>
            <Input
              id={`c-prem-${neg.id}`}
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`c-settle-${neg.id}`}>Settles</Label>
            <Input
              id={`c-settle-${neg.id}`}
              type="date"
              value={settle}
              onChange={(e) => setSettle(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 flex justify-end gap-2">
            <Button
              size="sm"
              disabled={submitting}
              onClick={() =>
                onConfirm({
                  quantity: qty,
                  strike_price: strike,
                  premium,
                  settlement_date: settle,
                })
              }
            >
              {submitting ? 'Sending…' : 'Send counter'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
