import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { useExerciseOtcOptionContract, useOtcOptionContract } from '@/hooks/useOtcOptions'
import { notifySuccess } from '@/lib/errors'
import { ExerciseContractDialog } from '@/views/otcContracts/components/ExerciseContractDialog'
import { OtcOptionStatusBadge } from '@/views/otcContracts/components/OtcOptionStatusBadge'
import { ViewShell } from '@/views/shared'

export function OtcContractDetailView() {
  const { id } = useParams<{ id: string }>()
  const contractId = Number(id) || 0
  const navigate = useNavigate()

  const { data, isLoading, isError } = useOtcOptionContract(contractId)

  const exerciseMutation = useExerciseOtcOptionContract(contractId)
  const [exerciseOpen, setExerciseOpen] = useState(false)

  if (isLoading) {
    return (
      <ViewShell>
        <Skeleton className="h-64 w-full rounded-xl" />
      </ViewShell>
    )
  }
  if (isError || !data) {
    return (
      <ViewShell title="Contract">
        <ErrorFallback message="Could not load contract." />
      </ViewShell>
    )
  }

  const { contract } = data
  const isActive = contract.status === 'ACTIVE'

  return (
    <ViewShell
      title={
        <span className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/otc/contracts')}>
            ← Back
          </Button>
          Contract #{contract.id}
          <OtcOptionStatusBadge status={contract.status} />
        </span>
      }
      actions={
        isActive ? <Button onClick={() => setExerciseOpen(true)}>Exercise contract</Button> : null
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Metric label="Stock" value={contract.ticker} />
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

      {exerciseOpen && (
        <ExerciseContractDialog
          open
          onOpenChange={setExerciseOpen}
          contract={contract}
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
    </ViewShell>
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
