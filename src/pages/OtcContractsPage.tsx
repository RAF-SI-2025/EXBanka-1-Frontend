import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useMyOtcOptionContracts } from '@/hooks/useOtcOptions'
import { OtcContractsTable } from '@/components/otc/OtcContractsTable'
import type { MyContractsFilters } from '@/types/otcOption'

export function OtcContractsPage() {
  const [role, setRole] = useState<MyContractsFilters['role']>('either')
  const { data, isLoading } = useMyOtcOptionContracts({ role })
  const contracts = data?.contracts ?? []

  const active = contracts.filter((c) => c.status === 'ACTIVE')
  const expiredOrExercised = contracts.filter((c) => c.status !== 'ACTIVE')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OTC Option Contracts</h1>

      <Tabs value={role} onValueChange={(v) => v && setRole(v as MyContractsFilters['role'])}>
        <TabsList>
          <TabsTrigger value="either">All</TabsTrigger>
          <TabsTrigger value="buyer">As buyer</TabsTrigger>
          <TabsTrigger value="seller">As seller</TabsTrigger>
        </TabsList>
        <TabsContent value={role ?? 'either'} className="mt-3 space-y-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <>
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Active</h2>
                <OtcContractsTable contracts={active} />
              </section>
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Concluded / Expired</h2>
                <OtcContractsTable contracts={expiredOrExercised} />
              </section>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
