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
  useCounterOtcOptionOffer,
  useAcceptOtcOptionOffer,
  useRejectOtcOptionOffer,
} from '@/hooks/useOtcOptions'
import { useClientAccounts } from '@/hooks/useAccounts'
import { OtcOptionStatusBadge } from '@/components/otc/OtcOptionStatusBadge'
import { CounterOfferDialog } from '@/components/otc/CounterOfferDialog'
import { AcceptOfferDialog } from '@/components/otc/AcceptOfferDialog'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { notifySuccess } from '@/lib/errors'

export function OtcOfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const offerId = Number(id) || 0
  const navigate = useNavigate()

  const { data, isLoading, isError } = useOtcOptionOffer(offerId)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const counterMutation = useCounterOtcOptionOffer(offerId)
  const acceptMutation = useAcceptOtcOptionOffer(offerId)
  const rejectMutation = useRejectOtcOptionOffer(offerId)

  const [counterOpen, setCounterOpen] = useState(false)
  const [acceptOpen, setAcceptOpen] = useState(false)

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />
  }
  if (isError || !data) {
    return <ErrorFallback message="Could not load offer." />
  }

  const { offer, revisions } = data
  const isPending = offer.status === 'PENDING'

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
          <CardTitle>Current terms</CardTitle>
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

      {isPending && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setAcceptOpen(true)}>Accept</Button>
          <Button variant="outline" onClick={() => setCounterOpen(true)}>
            Counter
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              rejectMutation.mutate(undefined, {
                onSuccess: () => notifySuccess('Offer rejected.'),
              })
            }
            disabled={rejectMutation.isPending}
          >
            Reject
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Revisions</CardTitle>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revisions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Strike</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...revisions]
                  .sort((a, b) => b.revision_number - a.revision_number)
                  .map((r) => (
                    <TableRow key={r.revision_number}>
                      <TableCell>{r.revision_number}</TableCell>
                      <TableCell>
                        {r.modified_by.principal_type} #{r.modified_by.principal_id}
                      </TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell>{r.strike_price}</TableCell>
                      <TableCell>{r.premium ?? '—'}</TableCell>
                      <TableCell>{r.settlement_date}</TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {counterOpen && (
        <CounterOfferDialog
          open
          onOpenChange={setCounterOpen}
          current={offer}
          loading={counterMutation.isPending}
          onSubmit={(payload) =>
            counterMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess('Counter sent.')
                setCounterOpen(false)
              },
            })
          }
        />
      )}

      {acceptOpen && (
        <AcceptOfferDialog
          open
          onOpenChange={setAcceptOpen}
          accounts={accounts}
          loading={acceptMutation.isPending}
          onSubmit={(payload) =>
            acceptMutation.mutate(payload, {
              onSuccess: ({ contract }) => {
                notifySuccess(`Contract #${contract.id} created.`)
                setAcceptOpen(false)
                navigate(`/otc/contracts/${contract.id}`)
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
