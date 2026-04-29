import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useOtcOptionContract, useExerciseOtcOptionContract } from '@/hooks/useOtcOptions'
import { useClientAccounts } from '@/hooks/useAccounts'
import { OtcOptionStatusBadge } from '@/components/otc/OtcOptionStatusBadge'
import { ExerciseContractDialog } from '@/components/otc/ExerciseContractDialog'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { notifySuccess } from '@/lib/errors'

export function OtcContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const contractId = Number(id) || 0
  const navigate = useNavigate()

  const { data, isLoading, isError } = useOtcOptionContract(contractId)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const exerciseMutation = useExerciseOtcOptionContract(contractId)
  const [exerciseOpen, setExerciseOpen] = useState(false)

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (isError || !data) return <ErrorFallback message="Could not load contract." />

  const { contract } = data
  const isActive = contract.status === 'ACTIVE'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/otc/contracts')}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">Contract #{contract.id}</h1>
        <OtcOptionStatusBadge status={contract.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Metric label="Stock" value={`#${contract.stock_id}`} />
          <Metric label="Quantity" value={contract.quantity} />
          <Metric label="Strike" value={contract.strike_price} />
          <Metric label="Premium" value={contract.premium} />
          <Metric label="Settlement" value={contract.settlement_date} />
          <Metric
            label="Buyer / Seller"
            value={`${contract.buyer.owner_type}#${contract.buyer.owner_id ?? '-'} → ${contract.seller.owner_type}#${contract.seller.owner_id ?? '-'}`}
          />
        </CardContent>
      </Card>

      {isActive && <Button onClick={() => setExerciseOpen(true)}>Exercise contract</Button>}

      {exerciseOpen && (
        <ExerciseContractDialog
          open
          onOpenChange={setExerciseOpen}
          contract={contract}
          accounts={accounts}
          loading={exerciseMutation.isPending}
          onSubmit={(payload) =>
            exerciseMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess(`Contract #${contract.id} exercised.`)
                setExerciseOpen(false)
                navigate('/portfolio')
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
