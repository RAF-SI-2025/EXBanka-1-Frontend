import { useState } from 'react'
import { useFees, useCreateFee, useUpdateFee, useDeleteFee } from '@/hooks/useFees'
import type { TransferFee, CreateFeePayload, UpdateFeePayload } from '@/types/fee'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { FeesTable } from '@/components/admin/FeesTable'
import { CreateFeeDialog } from '@/components/admin/CreateFeeDialog'
import { EditFeeDialog } from '@/components/admin/EditFeeDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function AdminFeesPage() {
  const { data: feesData, isLoading } = useFees()
  const createFeeMutation = useCreateFee()
  const updateFeeMutation = useUpdateFee()
  const deleteFeeMutation = useDeleteFee()

  const [createOpen, setCreateOpen] = useState(false)
  const [editFee, setEditFee] = useState<TransferFee | null>(null)
  const [deactivateFee, setDeactivateFee] = useState<TransferFee | null>(null)

  const fees = feesData?.fees ?? []

  function handleCreateFee(payload: CreateFeePayload) {
    createFeeMutation.mutate(payload, {
      onSuccess: () => setCreateOpen(false),
    })
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transfer Fees</h1>
        <Button onClick={() => setCreateOpen(true)}>Create Fee Rule</Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : fees.length ? (
        <FeesTable
          fees={fees}
          onEdit={setEditFee}
          onDeactivate={setDeactivateFee}
          onReactivate={handleReactivate}
        />
      ) : (
        <p>No fee rules found.</p>
      )}

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

      {/* Deactivate confirmation dialog */}
      <Dialog
        open={deactivateFee !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeactivateFee(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deactivate</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to deactivate the fee rule &quot;{deactivateFee?.name}&quot;? This
            will stop it from being applied to new transactions.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateFee(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivate}
              disabled={deleteFeeMutation.isPending}
            >
              {deleteFeeMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
