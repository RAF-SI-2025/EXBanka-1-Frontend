import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  useMyOtcOptionOffers,
  useAllOtcOptionOffers,
  useCreateOtcOptionOffer,
} from '@/hooks/useOtcOptions'
import { useClientAccounts, useBankAccounts } from '@/hooks/useAccounts'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { OtcOptionOffersTable } from '@/components/otc/OtcOptionOffersTable'
import { CreateOptionOfferDialog } from '@/components/otc/CreateOptionOfferDialog'
import { notifySuccess } from '@/lib/errors'

type OffersTab = 'all' | 'me'

export function OtcOffersPage() {
  const userType = useAppSelector(selectUserType)
  const isEmployee = userType === 'employee'

  const [tab, setTab] = useState<OffersTab>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const isAll = tab === 'all'
  const allQuery = useAllOtcOptionOffers({}, { enabled: isAll })
  const meQuery = useMyOtcOptionOffers({}, { enabled: !isAll })

  const { data, isLoading } = isAll ? allQuery : meQuery
  const offers = data?.offers ?? []

  const { data: portfolioData } = usePortfolio()
  const holdings = portfolioData?.holdings ?? []

  const { data: clientAccountsData } = useClientAccounts(!isEmployee)
  const { data: bankAccountsData } = useBankAccounts(isEmployee)
  const accounts = (isEmployee ? bankAccountsData?.accounts : clientAccountsData?.accounts) ?? []

  const createMutation = useCreateOtcOptionOffer()

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
        <TabsContent value={tab} className="mt-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <OtcOptionOffersTable offers={offers} />
          )}
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
    </div>
  )
}
