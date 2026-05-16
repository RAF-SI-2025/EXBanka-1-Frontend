import { useState } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  useMyOtcOptionOffers,
  useAllOtcOptionOffers,
  useCreateOtcOptionOffer,
  usePlaceBidOnOtcOption,
} from '@/hooks/useOtcOptions'
import { useClientAccounts, useBankAccounts } from '@/hooks/useAccounts'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType, selectCurrentUser } from '@/store/selectors/authSelectors'
import { OtcOptionOffersTable } from '@/components/otc/OtcOptionOffersTable'
import { CreateOptionOfferDialog } from '@/components/otc/CreateOptionOfferDialog'
import { PlaceBidDialog } from '@/components/otc/PlaceBidDialog'
import { notifySuccess } from '@/lib/errors'
import type { MyOtcOffersResponse, OtcOffer } from '@/types/otcOption'

type OffersTab = 'all' | 'me'

export function OtcOffersPage() {
  const userType = useAppSelector(selectUserType)
  const currentUser = useAppSelector(selectCurrentUser)
  const isEmployee = userType === 'employee'

  const [tab, setTab] = useState<OffersTab>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [bidTarget, setBidTarget] = useState<OtcOffer | null>(null)

  const isAll = tab === 'all'
  const allQuery = useAllOtcOptionOffers({}, { enabled: isAll })
  const meQuery = useMyOtcOptionOffers({}, { enabled: !isAll })

  const { data: portfolioData } = usePortfolio()
  const holdings = portfolioData?.holdings ?? []

  const { data: clientAccountsData } = useClientAccounts(!isEmployee)
  const { data: bankAccountsData } = useBankAccounts(isEmployee)
  const accounts =
    (isEmployee ? bankAccountsData?.accounts : clientAccountsData?.accounts) ?? []

  const createMutation = useCreateOtcOptionOffer()
  const placeBidMutation = usePlaceBidOnOtcOption(bidTarget?.id ?? 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">OTC Option Offers</h1>
        <Button onClick={() => setCreateOpen(true)}>New offer</Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => v && setTab(v as OffersTab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="me">Me</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-3">
          <OffersTab
            key="all"
            query={allQuery}
            currentUserId={currentUser?.id}
            onBid={setBidTarget}
          />
        </TabsContent>
        <TabsContent value="me" className="mt-3">
          <OffersTab
            key="me"
            query={meQuery}
            currentUserId={currentUser?.id}
            onBid={setBidTarget}
          />
        </TabsContent>
      </Tabs>

      {createOpen && (
        <CreateOptionOfferDialog
          open
          onOpenChange={setCreateOpen}
          holdings={holdings}
          accounts={accounts}
          loading={createMutation.isPending}
          onSubmit={(payload) =>
            createMutation.mutate(payload, {
              onSuccess: ({ offer }) => {
                notifySuccess(`Offer #${offer.id} created.`)
                setCreateOpen(false)
              },
            })
          }
        />
      )}

      {bidTarget && (
        <PlaceBidDialog
          open
          onOpenChange={(o) => !o && setBidTarget(null)}
          listing={bidTarget}
          accounts={accounts}
          loading={placeBidMutation.isPending}
          onSubmit={(payload) =>
            placeBidMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess('Bid placed.')
                setBidTarget(null)
              },
            })
          }
        />
      )}
    </div>
  )
}

interface OffersTabProps {
  query: UseQueryResult<MyOtcOffersResponse, unknown>
  currentUserId?: number
  onBid: (offer: OtcOffer) => void
}

function OffersTab({ query, currentUserId, onBid }: OffersTabProps) {
  const { data, isLoading } = query
  const offers = data?.offers ?? []

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    )
  }
  return <OtcOptionOffersTable offers={offers} currentUserId={currentUserId} onBid={onBid} />
}
