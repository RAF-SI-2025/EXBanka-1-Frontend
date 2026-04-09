import { useState } from 'react'
import {
  useInterestRateTiers,
  useCreateTier,
  useUpdateTier,
  useDeleteTier,
  useApplyTier,
} from '@/hooks/useInterestRateTiers'
import { useBankMargins, useUpdateBankMargin } from '@/hooks/useBankMargins'
import type { InterestRateTier, CreateTierPayload } from '@/types/interestRateTiers'
import type { BankMargin } from '@/types/bankMargins'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { InterestRateTiersTable } from '@/components/admin/InterestRateTiersTable'
import { BankMarginsTable } from '@/components/admin/BankMarginsTable'
import { CreateTierDialog } from '@/components/admin/CreateTierDialog'
import { EditTierDialog } from '@/components/admin/EditTierDialog'
import { EditMarginDialog } from '@/components/admin/EditMarginDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function AdminInterestRatesPage() {
  const { data: tiersData, isLoading: tiersLoading } = useInterestRateTiers()
  const { data: marginsData, isLoading: marginsLoading } = useBankMargins()
  const createTierMutation = useCreateTier()
  const updateTierMutation = useUpdateTier()
  const deleteTierMutation = useDeleteTier()
  const applyTierMutation = useApplyTier()
  const updateMarginMutation = useUpdateBankMargin()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTier, setEditTier] = useState<InterestRateTier | null>(null)
  const [deleteTier, setDeleteTier] = useState<InterestRateTier | null>(null)
  const [applyTier, setApplyTier] = useState<InterestRateTier | null>(null)
  const [applyResult, setApplyResult] = useState<number | null>(null)
  const [editMargin, setEditMargin] = useState<BankMargin | null>(null)

  const tiers = tiersData?.tiers ?? []
  const margins = marginsData?.margins ?? []
  const isLoading = tiersLoading || marginsLoading

  function handleCreateTier(payload: CreateTierPayload) {
    createTierMutation.mutate(payload, {
      onSuccess: () => setCreateOpen(false),
    })
  }

  function handleSaveTier(id: number, payload: CreateTierPayload) {
    updateTierMutation.mutate({ id, payload }, { onSuccess: () => setEditTier(null) })
  }

  function handleConfirmDelete() {
    if (!deleteTier) return
    deleteTierMutation.mutate(deleteTier.id, {
      onSuccess: () => setDeleteTier(null),
    })
  }

  function handleConfirmApply() {
    if (!applyTier) return
    applyTierMutation.mutate(applyTier.id, {
      onSuccess: (data) => {
        setApplyTier(null)
        setApplyResult(data.affected_loans)
      },
    })
  }

  function handleSaveMargin(id: number, margin: number) {
    updateMarginMutation.mutate({ id, margin }, { onSuccess: () => setEditMargin(null) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Interest Rates</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Tabs defaultValue="tiers">
          <TabsList className="mb-4">
            <TabsTrigger value="tiers">Interest Rate Tiers</TabsTrigger>
            <TabsTrigger value="margins">Bank Margins</TabsTrigger>
          </TabsList>

          <TabsContent value="tiers">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setCreateOpen(true)}>Create Tier</Button>
            </div>
            {tiers.length ? (
              <InterestRateTiersTable
                tiers={tiers}
                onEdit={setEditTier}
                onDelete={setDeleteTier}
                onApply={setApplyTier}
              />
            ) : (
              <p>No interest rate tiers found.</p>
            )}
          </TabsContent>

          <TabsContent value="margins">
            {margins.length ? (
              <BankMarginsTable margins={margins} onEdit={setEditMargin} />
            ) : (
              <p>No bank margins found.</p>
            )}
          </TabsContent>
        </Tabs>
      )}

      <CreateTierDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTier}
        loading={createTierMutation.isPending}
      />

      <EditTierDialog
        open={editTier !== null}
        tier={editTier}
        onClose={() => setEditTier(null)}
        onSave={handleSaveTier}
        loading={updateTierMutation.isPending}
      />

      <EditMarginDialog
        open={editMargin !== null}
        margin={editMargin}
        onClose={() => setEditMargin(null)}
        onSave={handleSaveMargin}
        loading={updateMarginMutation.isPending}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTier !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTier(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this interest rate tier? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTier(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteTierMutation.isPending}
            >
              {deleteTierMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply confirmation dialog */}
      <Dialog
        open={applyTier !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setApplyTier(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Tier to Loans</DialogTitle>
          </DialogHeader>
          <p>
            This will update interest rates for all active variable-rate loans in this tier range.
            Are you sure you want to proceed?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyTier(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmApply} disabled={applyTierMutation.isPending}>
              {applyTierMutation.isPending ? 'Applying...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply result dialog */}
      <Dialog
        open={applyResult !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setApplyResult(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tier Applied Successfully</DialogTitle>
          </DialogHeader>
          <p>{applyResult} loans updated.</p>
          <DialogFooter>
            <Button onClick={() => setApplyResult(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
