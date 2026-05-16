import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useOtcOptionOffer,
  useOtcOptionNegotiations,
  useCounterOtcNegotiation,
  useAcceptOtcNegotiation,
  useRejectOtcNegotiation,
  useCancelOtcNegotiation,
} from '@/hooks/useOtcOptions'
import { useClientAccounts, useBankAccounts } from '@/hooks/useAccounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType, selectCurrentUser } from '@/store/selectors/authSelectors'
import { OtcOptionStatusBadge } from '@/components/otc/OtcOptionStatusBadge'
import { CounterOfferDialog } from '@/components/otc/CounterOfferDialog'
import { AcceptOfferDialog } from '@/components/otc/AcceptOfferDialog'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { notifySuccess } from '@/lib/errors'
import type { OtcNegotiation } from '@/types/otcOption'

export function OtcOfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const offerId = Number(id) || 0
  const navigate = useNavigate()

  const currentUser = useAppSelector(selectCurrentUser)
  const userType = useAppSelector(selectUserType)
  const isEmployee = userType === 'employee'

  const offerQuery = useOtcOptionOffer(offerId)

  // Compute viewer role early so the right negotiation endpoint fires.
  // Hooks below must run unconditionally, so derive isPoster from the
  // currently-loaded offer (false while the offer is still loading; the
  // queries flip on when the role is known).
  const loadedOffer = offerQuery.data?.offer
  const ownerType = loadedOffer?.initiator?.owner_type
  const ownerId = loadedOffer?.initiator?.owner_id
  const isPosterLive = loadedOffer
    ? isEmployee
      ? ownerType === 'bank' ||
        (ownerType === 'employee' && currentUser?.id != null && ownerId === currentUser.id)
      : ownerType === 'client' && currentUser?.id != null && ownerId === currentUser.id
    : false

  // All viewers see every chain on the listing via the public detail
  // endpoint (per spec: "visible to all parties"). Per-chain action
  // buttons stay gated by role so a non-party viewer is read-only.
  const chainsQuery = useOtcOptionNegotiations(offerId)

  const { data: clientAccountsData } = useClientAccounts(!isEmployee)
  const { data: bankAccountsData } = useBankAccounts(isEmployee)
  const accounts = (isEmployee ? bankAccountsData?.accounts : clientAccountsData?.accounts) ?? []

  const [selectedChain, setSelectedChain] = useState<OtcNegotiation | null>(null)
  const [dialog, setDialog] = useState<'counter' | 'accept' | null>(null)

  const closeDialog = () => {
    setDialog(null)
    setSelectedChain(null)
  }

  // Always-defined negotiation id for hook initialisation; mutation calls
  // short-circuit if `selectedChain` is null.
  const targetChainId = selectedChain?.id ?? 0
  const counterMutation = useCounterOtcNegotiation(offerId, targetChainId)
  const acceptMutation = useAcceptOtcNegotiation(offerId, targetChainId)
  const rejectMutation = useRejectOtcNegotiation(offerId, targetChainId)
  const cancelMutation = useCancelOtcNegotiation(offerId, targetChainId)

  if (offerQuery.isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (offerQuery.isError || !offerQuery.data)
    return <ErrorFallback message="Could not load offer." />

  const { offer } = offerQuery.data
  const isPoster = isPosterLive
  const negotiations = chainsQuery.data?.negotiations ?? []
  const negotiationsLoading = chainsQuery.isLoading

  const handleReject = (chain: OtcNegotiation) => {
    setSelectedChain(chain)
    rejectMutation.mutate(undefined, {
      onSuccess: () => {
        notifySuccess(`Negotiation #${chain.id} declined.`)
        setSelectedChain(null)
      },
    })
  }

  const handleCancel = (chain: OtcNegotiation) => {
    setSelectedChain(chain)
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        notifySuccess(`Negotiation #${chain.id} cancelled.`)
        setSelectedChain(null)
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/otc/offers')}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">Offer #{offer.id}</h1>
        <OtcOptionStatusBadge status={offer.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing terms</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Metric label="Direction" value={offer.direction.replace('_', ' ')} />
          <Metric label="Stock" value={`#${offer.stock_id}`} />
          <Metric label="Quantity" value={offer.quantity} />
          <Metric label="Strike" value={offer.strike_price} />
          <Metric label="Premium" value={offer.premium ?? '—'} />
          <Metric label="Settlement" value={offer.settlement_date} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Negotiation chains ({negotiations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {negotiationsLoading ? (
            <Skeleton className="h-12 w-full rounded-md" />
          ) : negotiations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bids placed yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Bidder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Strike</TableHead>
                  <TableHead className="text-right">Premium</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {negotiations.map((n, idx) => {
                  const isMyChain = n.bidder?.owner_id === currentUser?.id
                  const myTurnToAct =
                    n.status === 'open' || n.status === 'countered'
                      ? n.last_action_by?.owner_id !== currentUser?.id
                      : false
                  const canActAsPoster =
                    isPoster && (n.status === 'open' || n.status === 'countered')
                  const canActAsBidder =
                    isMyChain && (n.status === 'open' || n.status === 'countered')

                  return (
                    <TableRow key={`${n.id ?? 'unknown'}-${idx}`}>
                      <TableCell>{n.id}</TableCell>
                      <TableCell>
                        {n.bidder_name ??
                          (n.bidder
                            ? `${n.bidder.owner_type} #${n.bidder.owner_id ?? '-'}`
                            : '—')}
                        {isMyChain && (
                          <span className="ml-1 text-xs text-muted-foreground italic">(you)</span>
                        )}
                      </TableCell>
                      <TableCell>{n.status}</TableCell>
                      <TableCell className="text-right">{n.quantity}</TableCell>
                      <TableCell className="text-right">{n.strike_price}</TableCell>
                      <TableCell className="text-right">{n.premium ?? '—'}</TableCell>
                      <TableCell>{n.settlement_date}</TableCell>
                      <TableCell>{new Date(n.updated_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {(canActAsPoster || canActAsBidder) && myTurnToAct && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedChain(n)
                                setDialog('accept')
                              }}
                            >
                              Accept
                            </Button>
                          )}
                          {(canActAsPoster || canActAsBidder) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedChain(n)
                                setDialog('counter')
                              }}
                            >
                              Counter
                            </Button>
                          )}
                          {canActAsPoster && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(n)}
                              disabled={rejectMutation.isPending}
                            >
                              Decline
                            </Button>
                          )}
                          {canActAsBidder && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancel(n)}
                              disabled={cancelMutation.isPending}
                            >
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {dialog === 'counter' && selectedChain && (
        <CounterOfferDialog
          open
          onOpenChange={(o) => !o && closeDialog()}
          current={selectedChain}
          loading={counterMutation.isPending}
          onSubmit={(payload) =>
            counterMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess('Counter sent.')
                closeDialog()
              },
            })
          }
        />
      )}

      {dialog === 'accept' && selectedChain && (
        <AcceptOfferDialog
          open
          onOpenChange={(o) => !o && closeDialog()}
          accounts={accounts}
          loading={acceptMutation.isPending}
          onSubmit={(payload) =>
            acceptMutation.mutate(payload, {
              onSuccess: ({ contract }) => {
                if (contract) {
                  notifySuccess(`Contract #${contract.id} created.`)
                  closeDialog()
                  navigate(`/otc/contracts/${contract.id}`)
                } else {
                  notifySuccess('Negotiation accepted, but contract formation failed.')
                  closeDialog()
                }
              },
            })
          }
        />
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
