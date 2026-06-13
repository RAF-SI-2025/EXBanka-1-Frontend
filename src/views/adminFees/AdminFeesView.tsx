import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateFeeDialog } from '@/views/adminFees/components/CreateFeeDialog'
import { DeactivateFeeDialog } from '@/views/adminFees/components/DeactivateFeeDialog'
import { EditFeeDialog } from '@/views/adminFees/components/EditFeeDialog'
import { FeesTable } from '@/views/adminFees/components/FeesTable'
import { useCreateFee, useDeleteFee, useFees, useUpdateFee } from '@/views/adminFees/hooks/useFees'
import type { CreateFeePayload, TransferFee, UpdateFeePayload } from '@/views/adminFees/types'
import { EmptyState, ErrorState, LoadingState, ViewShell } from '@/views/shared'

export function AdminFeesView() {
  const { data: feesData, isLoading, error } = useFees()
  const createFeeMutation = useCreateFee()
  const updateFeeMutation = useUpdateFee()
  const deleteFeeMutation = useDeleteFee()

  const [createOpen, setCreateOpen] = useState(false)
  const [editFee, setEditFee] = useState<TransferFee | null>(null)
  const [deactivateFee, setDeactivateFee] = useState<TransferFee | null>(null)

  const fees = feesData?.fees ?? []

  function handleCreateFee(payload: CreateFeePayload) {
    createFeeMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) })
  }

  function handleSaveFee(id: number, payload: UpdateFeePayload) {
    updateFeeMutation.mutate({ id, payload }, { onSuccess: () => setEditFee(null) })
  }

  function handleConfirmDeactivate() {
    if (!deactivateFee) return
    deleteFeeMutation.mutate(deactivateFee.id, {
      onSuccess: () => setDeactivateFee(null),
    })
  }

  function handleReactivate(fee: TransferFee) {
    updateFeeMutation.mutate({ id: fee.id, payload: { active: true } })
  }

  return (
    <ViewShell
      title="Transfer Fees"
      subtitle="Configure how fees are calculated on transfers and payments."
      actions={<Button onClick={() => setCreateOpen(true)}>Create Fee Rule</Button>}
    >
      <Card>
        <CardContent className="pt-6">
          {isLoading && <LoadingState />}
          {error && <ErrorState message="Could not load fees." />}
          {!isLoading && !error && fees.length === 0 && (
            <EmptyState
              title="No fee rules found."
              hint="Create a fee rule to start charging on transfers."
            />
          )}
          {!isLoading && !error && fees.length > 0 && (
            <FeesTable
              fees={fees}
              onEdit={setEditFee}
              onDeactivate={setDeactivateFee}
              onReactivate={handleReactivate}
            />
          )}
        </CardContent>
      </Card>

      <CreateFeeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateFee}
        loading={createFeeMutation.isPending}
      />

      <EditFeeDialog
        open={editFee !== null}
        fee={editFee}
        onClose={() => setEditFee(null)}
        onSave={handleSaveFee}
        loading={updateFeeMutation.isPending}
      />

      <DeactivateFeeDialog
        fee={deactivateFee}
        loading={deleteFeeMutation.isPending}
        onCancel={() => setDeactivateFee(null)}
        onConfirm={handleConfirmDeactivate}
      />
    </ViewShell>
  )
}
