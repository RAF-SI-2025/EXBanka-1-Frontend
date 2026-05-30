import { useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { useBankAccounts, useClientAccounts } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OtcOptionsTable } from '@/views/otcOptions/components/OtcOptionsTable'
import { PlaceBidDialog } from '@/views/otcOptions/components/PlaceBidDialog'
import { CreateOtcOptionDialog } from '@/views/otcOptions/components/CreateOtcOptionDialog'
import { OfferActivityPanel } from '@/views/otcOptions/components/OfferActivityPanel'
import { BidderActivityPanel } from '@/views/otcOptions/components/BidderActivityPanel'
import { isOwnRow } from '@/views/otcOptions/lib/ownership'
import {
  useAllOtcOptions,
  useMyActiveOtcNegotiations,
  useMyOtcOptions,
} from '@/views/otcOptions/hooks/useOtcOptionsLists'
import { useBidOrCounter } from '@/views/otcOptions/hooks/useBidOrCounter'
import { useCreateOtcOption } from '@/views/otcOptions/hooks/useOtcOptionMutations'
import type { OtcOptionRow, OtcOptionsMode, OtcOwnerType } from '@/views/otcOptions/types'
import { ViewShell, LoadingState, ErrorState, panelEnter } from '@/views/shared'

export function OtcOptionsView() {
  const user = useAppSelector(selectCurrentUser)
  const isEmployee = user?.system_type === 'employee'
  const clientAccountsQ = useClientAccounts(!isEmployee)
  const bankAccountsQ = useBankAccounts(isEmployee)
  const accounts =
    (isEmployee ? bankAccountsQ.data?.accounts : clientAccountsQ.data?.accounts) ?? []

  const [mode, setMode] = useState<OtcOptionsMode>('all')
  const [bidOffer, setBidOffer] = useState<OtcOptionRow | null>(null)
  const [activityOffer, setActivityOffer] = useState<OtcOptionRow | null>(null)
  const [bidderOffer, setBidderOffer] = useState<OtcOptionRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  // Only the marketplace table consumes `myNegotiationsQ` (for the "Bid" vs
  // "Counter" label). Suppress it while a detail panel is open so the bidder
  // page doesn't fire a spurious /me/otc/options/negotiations?statuses=… call.
  const marketplaceVisible = !activityOffer && !bidderOffer
  const allQ = useAllOtcOptions({})
  const mineQ = useMyOtcOptions({})
  const myNegotiationsQ = useMyActiveOtcNegotiations(marketplaceVisible)

  const myBidOfferIds = useMemo(() => {
    const s = new Set<number>()
    for (const n of myNegotiationsQ.data?.negotiations ?? []) {
      const id = n.parent_offer_id ?? n.offer_id
      if (id != null) s.add(Number(id))
    }
    return s
  }, [myNegotiationsQ.data])

  const bidOrCounter = useBidOrCounter()
  const createListing = useCreateOtcOption()

  const currentBidder = useMemo(() => {
    if (!user) return null
    const owner_type: OtcOwnerType = user.system_type === 'employee' ? 'employee' : 'client'
    return { owner_type, owner_id: user.id }
  }, [user])

  const rows: OtcOptionRow[] =
    mode === 'all' ? (allQ.data?.offers ?? []) : (mineQ.data?.offers ?? [])

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
      <ViewShell className={panelEnter}>
        <OfferActivityPanel
          offer={activityOffer}
          accounts={accounts}
          currentPrincipal={currentBidder}
          onBack={() => setActivityOffer(null)}
        />
      </ViewShell>
    )
  }

  if (bidderOffer && currentBidder) {
    return (
      <ViewShell className={panelEnter}>
        <BidderActivityPanel
          offer={bidderOffer}
          accounts={accounts}
          currentBidder={currentBidder}
          onBack={() => setBidderOffer(null)}
          onPlaceBid={(row) => {
            setBidderOffer(null)
            setBidOffer(row)
          }}
        />
      </ViewShell>
    )
  }

  const handleRowOpen = (row: OtcOptionRow) => {
    const own = mode === 'my' || isOwnRow(row, currentBidder)
    if (own) setActivityOffer(row)
    else setBidderOffer(row)
  }

  return (
    <ViewShell
      title="OTC Options"
      actions={<Button onClick={() => setCreateOpen(true)}>New listing</Button>}
    >
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
          {loading && <LoadingState />}
          {error && <ErrorState message="Could not load offers." />}
          {!loading && !error && (
            <OtcOptionsTable
              rows={rows}
              currentBidder={currentBidder}
              forceOwn={mode === 'my'}
              myBidOfferIds={myBidOfferIds}
              onBid={(row) => setBidOffer(row)}
              onActivity={(row) => setActivityOffer(row)}
              onRowOpen={handleRowOpen}
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
    </ViewShell>
  )
}
