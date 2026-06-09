import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Account } from '@/types/account'
import type {
  CounterNegotiationPayload,
  OtcNegotiation,
  OtcOptionRow,
  OtcParty,
} from '@/views/otcOptions/types'
import {
  useCounterNegotiation,
  useWithdrawNegotiation,
} from '@/views/otcOptions/hooks/useOtcOptionMutations'
import {
  useAllMyOtcNegotiations,
  useOtcNegotiationRevisions,
} from '@/views/otcOptions/hooks/useOtcOptionsLists'
import { NegotiationRevisionsTable } from '@/views/otcOptions/components/NegotiationRevisionsTable'
import { isNegotiationActive } from '@/views/otcOptions/lib/negotiationStatus'
import { hasOwnNegotiationChain } from '@/views/otcOptions/lib/myNegotiation'

interface Props {
  offer: OtcOptionRow
  accounts: Account[]
  currentBidder: OtcParty
  onBack: () => void
  onPlaceBid: (offer: OtcOptionRow) => void
}

function partiesMatch(a: OtcParty, b: OtcParty): boolean {
  return a.owner_type === b.owner_type && a.owner_id === b.owner_id
}

export function BidderActivityPanel({ offer, accounts, currentBidder, onBack, onPlaceBid }: Props) {
  const offerId = Number(offer.offer_id)
  // Source the bidder's own chain from the caller-scoped endpoint so the
  // bidder page never reads competitors' chains via /otc/options/:id/...
  // The /me/... response is already filtered to chains the caller is a party
  // to; we just narrow to this listing.
  const { data, isLoading, error } = useAllMyOtcNegotiations()
  const counter = useCounterNegotiation(offerId)
  const withdraw = useWithdrawNegotiation(offerId)

  const myChain: OtcNegotiation | undefined = useMemo(() => {
    if (!data?.negotiations) return undefined
    // Primary: use the offer's my_negotiation_id — the direct bidder-chain id
    // returned by the discovery feed (spec §47.2). For remote offers the
    // parent_offer_id on the mirror row is the seller-bank's id (not our local
    // surrogate), so we can't rely on that fallback alone.
    if (hasOwnNegotiationChain(offer.my_negotiation_id)) {
      const negotiationId = Number(offer.my_negotiation_id)
      return data.negotiations.find((n) => n.id === negotiationId)
    }
    return data.negotiations.find((n) => Number(n.parent_offer_id ?? n.offer_id ?? 0) === offerId)
  }, [data, offer.my_negotiation_id, offerId])

  // Whose move is it? If the chain's last_action_by matches the bidder, the
  // owner is expected to respond; otherwise it's the bidder's turn.
  const whoseTurn: 'you' | 'owner' | null = myChain?.last_action_by
    ? partiesMatch(myChain.last_action_by, currentBidder)
      ? 'owner'
      : 'you'
    : null

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
              {offer.kind === 'remote' ? `bank ${offer.bank_code}` : 'local'} ·{' '}
              {offer.active_chains_count ?? 0} bidder
              {offer.active_chains_count === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Owner's listing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <Row label="Quantity" value={String(offer.amount)} />
          <Row label="Strike price" value={`${offer.strike_price} ${offer.strike_currency}`} />
          <Row label="Premium" value={`${offer.premium} ${offer.premium_currency}`} />
          <Row label="Settlement" value={offer.settlement_date?.slice(0, 10)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your bidding history</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {error && <p className="text-destructive">Could not load chain.</p>}
          {!isLoading && !error && !myChain && (
            <div className="space-y-3">
              <p className="text-muted-foreground">You haven't placed a bid on this listing yet.</p>
              <Button size="sm" onClick={() => onPlaceBid(offer)}>
                Place bid
              </Button>
            </div>
          )}
          {!isLoading && !error && myChain && (
            <YourChainBody
              chain={myChain}
              offerId={offerId}
              whoseTurn={whoseTurn}
              currentBidder={currentBidder}
              accounts={accounts}
              counterPending={counter.isPending}
              withdrawPending={withdraw.isPending}
              onCounter={(payload) => counter.mutate({ negotiationId: myChain.id, payload })}
              onWithdraw={() => withdraw.mutate(myChain.id, { onSuccess: onBack })}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right break-all">{value ?? '—'}</span>
    </div>
  )
}

function YourChainBody({
  chain,
  whoseTurn,
  currentBidder,
  accounts,
  counterPending,
  withdrawPending,
  onCounter,
  onWithdraw,
}: {
  chain: OtcNegotiation
  offerId: number
  whoseTurn: 'you' | 'owner' | null
  currentBidder: OtcParty
  accounts: Account[]
  counterPending: boolean
  withdrawPending: boolean
  onCounter: (payload: CounterNegotiationPayload) => void
  onWithdraw: () => void
}) {
  const [showCounterForm, setShowCounterForm] = useState(false)
  const isTerminal = !isNegotiationActive(chain.status)

  // The "Your chain" panel now leads with the full revision history so the
  // bidder sees every back-and-forth with the owner — the snapshot of the
  // latest revision is already the last row of that table.
  const revisionsQ = useOtcNegotiationRevisions(chain.id)

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Row label="Status" value={chain.status.toUpperCase()} />
        {whoseTurn && (
          <Row label="Waiting on" value={whoseTurn === 'you' ? 'You (owner countered)' : 'Owner'} />
        )}
      </div>

      <div className="border-t pt-3">
        {revisionsQ.isLoading && <p className="text-muted-foreground">Loading history…</p>}
        {revisionsQ.error && <p className="text-destructive">Could not load revision history.</p>}
        {!revisionsQ.isLoading && !revisionsQ.error && (
          <NegotiationRevisionsTable
            revisions={revisionsQ.data?.revisions ?? []}
            currentPrincipal={currentBidder}
          />
        )}
      </div>

      {!isTerminal && !showCounterForm && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowCounterForm(true)}
            disabled={counterPending}
          >
            Counter
          </Button>
          <Button size="sm" variant="destructive" onClick={onWithdraw} disabled={withdrawPending}>
            {withdrawPending ? 'Withdrawing…' : 'Withdraw'}
          </Button>
        </div>
      )}

      {!isTerminal && showCounterForm && (
        <CounterForm
          chain={chain}
          accounts={accounts}
          submitting={counterPending}
          onCancel={() => setShowCounterForm(false)}
          onSubmit={(payload) => {
            onCounter(payload)
            setShowCounterForm(false)
          }}
        />
      )}
    </div>
  )
}

function CounterForm({
  chain,
  submitting,
  onCancel,
  onSubmit,
}: {
  chain: OtcNegotiation
  accounts: Account[]
  submitting: boolean
  onCancel: () => void
  onSubmit: (payload: CounterNegotiationPayload) => void
}) {
  const [qty, setQty] = useState(chain.quantity)
  const [strike, setStrike] = useState(chain.strike_price)
  const [premium, setPremium] = useState(chain.premium ?? '')
  const [settle, setSettle] = useState(chain.settlement_date?.slice(0, 10) ?? '')

  return (
    <div className="space-y-2 border-t pt-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="bidder-counter-qty">Qty</Label>
          <Input id="bidder-counter-qty" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bidder-counter-strike">Strike</Label>
          <Input
            id="bidder-counter-strike"
            value={strike}
            onChange={(e) => setStrike(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bidder-counter-prem">Premium</Label>
          <Input
            id="bidder-counter-prem"
            value={premium}
            onChange={(e) => setPremium(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bidder-counter-settle">Settles</Label>
          <Input
            id="bidder-counter-settle"
            type="date"
            value={settle}
            onChange={(e) => setSettle(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={submitting}
          onClick={() =>
            onSubmit({
              quantity: qty,
              strike_price: strike,
              premium,
              settlement_date: settle,
            })
          }
        >
          {submitting ? 'Sending…' : 'Send counter'}
        </Button>
      </div>
    </div>
  )
}
