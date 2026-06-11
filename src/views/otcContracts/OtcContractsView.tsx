import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBankAccounts } from '@/hooks/useAccounts'
import { useExerciseOtcOptionContract, useMyOtcOptionContracts } from '@/hooks/useOtcOptions'
import { notifySuccess } from '@/lib/errors'
import type { MyContractsFilters, OptionContract } from '@/types/otcOption'
import { ExerciseContractDialog } from '@/views/otcContracts/components/ExerciseContractDialog'
import { OtcContractsTable } from '@/views/otcContracts/components/OtcContractsTable'
import { ViewShell } from '@/views/shared'

export function OtcContractsView() {
  const [role, setRole] = useState<MyContractsFilters['role']>('either')
  const { data, isLoading } = useMyOtcOptionContracts({ role })
  const contracts = data?.contracts ?? []

  const active = contracts.filter((c) => c.status === 'ACTIVE')
  const expiredOrExercised = contracts.filter((c) => c.status !== 'ACTIVE')

  const [exerciseTarget, setExerciseTarget] = useState<OptionContract | null>(null)
  const exerciseMutation = useExerciseOtcOptionContract(exerciseTarget?.id ?? 0)
  // A cross-bank (remote) contract must name the buyer's strike account on
  // exercise. The bank operator pays the strike from a BANK account
  // (REST_API_v3 §30 — an employee acting as the bank binds a bank account),
  // so source the picker from /bank-accounts, only when one is being exercised.
  const { data: accountsData } = useBankAccounts(exerciseTarget?.kind === 'remote')

  return (
    <ViewShell
      title="OTC Option Contracts"
      subtitle="Contracts you've signed as buyer or seller. Exercise active ones at any time."
    >
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
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <h2 className="text-lg font-semibold">Active</h2>
                  <OtcContractsTable contracts={active} onExercise={setExerciseTarget} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <h2 className="text-lg font-semibold">Concluded / Expired</h2>
                  <OtcContractsTable
                    contracts={expiredOrExercised}
                    onExercise={setExerciseTarget}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {exerciseTarget && (
        <ExerciseContractDialog
          open
          onOpenChange={(open) => !open && setExerciseTarget(null)}
          contract={exerciseTarget}
          accounts={accountsData?.accounts ?? []}
          loading={exerciseMutation.isPending}
          onSubmit={(payload) =>
            exerciseMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess(`Contract #${exerciseTarget.id} exercised.`)
                setExerciseTarget(null)
              },
            })
          }
        />
      )}
    </ViewShell>
  )
}
