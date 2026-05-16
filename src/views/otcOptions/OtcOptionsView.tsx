import { useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { useClientAccounts } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OtcOptionsTable } from '@/views/otcOptions/components/OtcOptionsTable'
import { PlaceBidDialog } from '@/views/otcOptions/components/PlaceBidDialog'
import { CreateOtcOptionDialog } from '@/views/otcOptions/components/CreateOtcOptionDialog'
import { OfferActivityPanel } from '@/views/otcOptions/components/OfferActivityPanel'
import { useAllOtcOptions, useMyOtcOptions } from '@/views/otcOptions/hooks/useOtcOptionsLists'
import { useBidOrCounter } from '@/views/otcOptions/hooks/useBidOrCounter'
import { useCreateOtcOption } from '@/views/otcOptions/hooks/useOtcOptionMutations'
import type {
  MyOtcOptionListing,
  OtcOptionRow,
  OtcOptionsMode,
  OtcOwnerType,
} from '@/views/otcOptions/types'

function myListingToRow(l: MyOtcOptionListing): OtcOptionRow {
  return {
    kind: 'local',
    bank_code: 'self',
    routing_number: 0,
    offer_id: l.id,
    seller_id: {
      owner_type: l.initiator.owner_type,
      id: l.initiator.owner_id ?? '',
    },
    direction: l.direction,
    ticker: l.ticker ?? `#${l.stock_id}`,
    amount: l.quantity,
    strike_price: l.strike_price,
    strike_currency: l.strike_currency ?? '',
    premium: l.premium ?? '',
    premium_currency: l.premium_currency ?? '',
    settlement_date: l.settlement_date,
    created_at: l.created_at,
    active_chains_count: l.active_chains_count,
  }
}

export function OtcOptionsView() {
  const user = useAppSelector(selectCurrentUser)
  const accountsQ = useClientAccounts()
  const accounts = accountsQ.data?.accounts ?? []

  const [mode, setMode] = useState<OtcOptionsMode>('all')
  const [bidOffer, setBidOffer] = useState<OtcOptionRow | null>(null)
  const [activityOffer, setActivityOffer] = useState<OtcOptionRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const allQ = useAllOtcOptions({})
  const mineQ = useMyOtcOptions({})

  const bidOrCounter = useBidOrCounter()
  const createListing = useCreateOtcOption()

  const currentBidder = useMemo(() => {
    if (!user) return null
    const owner_type: OtcOwnerType = user.system_type === 'employee' ? 'employee' : 'client'
    return { owner_type, owner_id: user.id }
  }, [user])

  const rows: OtcOptionRow[] =
    mode === 'all' ? (allQ.data?.offers ?? []) : (mineQ.data?.offers ?? []).map(myListingToRow)

  const peersInfo = allQ.data
  const banner =
    mode === 'all' && peersInfo
      ? `Local + ${peersInfo.peers_reached ?? 0}/${peersInfo.peers_total ?? 0} peer banks${
          peersInfo.partial ? ' (partial)' : ''
        }${peersInfo.last_refresh ? ` · refreshed ${peersInfo.last_refresh.slice(11, 19)}` : ''}`
      : null

  const loading = mode === 'all' ? allQ.isLoading : mineQ.isLoading
  const error = mode === 'all' ? allQ.error : mineQ.error

  if (activityOffer) {
    return (
      <div className="p-6">
        <OfferActivityPanel
          offer={activityOffer}
          accounts={accounts}
          onBack={() => setActivityOffer(null)}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">OTC Options</h1>
        <Button onClick={() => setCreateOpen(true)}>New listing</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Marketplace</CardTitle>
          <Tabs value={mode} onValueChange={(v) => setMode(v as OtcOptionsMode)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="my">My</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {banner && <p className="text-xs text-muted-foreground mb-3">{banner}</p>}
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {error && <p className="text-sm text-destructive">Could not load offers.</p>}
          {!loading && !error && (
            <OtcOptionsTable
              rows={rows}
              currentBidder={currentBidder}
              forceOwn={mode === 'my'}
              onBid={(row) => setBidOffer(row)}
              onActivity={(row) => setActivityOffer(row)}
            />
          )}
        </CardContent>
      </Card>

      <PlaceBidDialog
        open={bidOffer != null}
        onOpenChange={(v) => !v && setBidOffer(null)}
        offer={bidOffer}
        accounts={accounts}
        submitting={bidOrCounter.isPending}
        onSubmit={(input) => {
          if (!bidOffer || !currentBidder) return
          bidOrCounter.mutate(
            {
              offer_id: Number(bidOffer.offer_id),
              account_id: input.account_id,
              quantity: input.quantity,
              strike_price: input.strike_price,
              premium: input.premium,
              settlement_date: input.settlement_date,
              bidder: currentBidder,
            },
            { onSuccess: () => setBidOffer(null) }
          )
        }}
      />

      <CreateOtcOptionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        accounts={accounts}
        submitting={createListing.isPending}
        onSubmit={(payload) => {
          createListing.mutate(payload, { onSuccess: () => setCreateOpen(false) })
        }}
      />
    </div>
  )
}
