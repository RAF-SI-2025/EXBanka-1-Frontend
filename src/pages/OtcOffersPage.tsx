import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useMyOtcOptionOffers, useCreateOtcOptionOffer } from '@/hooks/useOtcOptions'
import { OtcOptionOffersTable } from '@/components/otc/OtcOptionOffersTable'
import { CreateOptionOfferDialog } from '@/components/otc/CreateOptionOfferDialog'
import { notifySuccess } from '@/lib/errors'
import type { MyOffersFilters } from '@/types/otcOption'

export function OtcOffersPage() {
  const [role, setRole] = useState<MyOffersFilters['role']>('either')
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useMyOtcOptionOffers({ role })
  const offers = data?.offers ?? []
  const createMutation = useCreateOtcOptionOffer()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">OTC Option Offers</h1>
        <Button onClick={() => setCreateOpen(true)}>New offer</Button>
      </div>

      <Tabs value={role} onValueChange={(v) => v && setRole(v as MyOffersFilters['role'])}>
        <TabsList>
          <TabsTrigger value="either">All</TabsTrigger>
          <TabsTrigger value="initiator">As initiator</TabsTrigger>
          <TabsTrigger value="counterparty">As counterparty</TabsTrigger>
        </TabsList>
        <TabsContent value={role ?? 'either'} className="mt-3">
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
