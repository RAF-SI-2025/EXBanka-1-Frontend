import { useState } from 'react'
import {
  usePeerBanks,
  useCreatePeerBank,
  useUpdatePeerBank,
  useDeletePeerBank,
} from '@/hooks/usePeerBanks'
import type { PeerBank, CreatePeerBankPayload, UpdatePeerBankPayload } from '@/types/peerBank'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PeerBanksTable } from '@/components/admin/PeerBanksTable'
import { CreatePeerBankDialog } from '@/components/admin/CreatePeerBankDialog'
import { EditPeerBankDialog } from '@/components/admin/EditPeerBankDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function AdminPeerBanksPage() {
  const { data, isLoading } = usePeerBanks()
  const createMutation = useCreatePeerBank()
  const updateMutation = useUpdatePeerBank()
  const deleteMutation = useDeletePeerBank()

  const [createOpen, setCreateOpen] = useState(false)
  const [editPeer, setEditPeer] = useState<PeerBank | null>(null)
  const [deletePeer, setDeletePeer] = useState<PeerBank | null>(null)

  const peerBanks = data?.peer_banks ?? []

  function handleCreate(payload: CreatePeerBankPayload) {
    createMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) })
  }

  function handleSave(id: number, payload: UpdatePeerBankPayload) {
    updateMutation.mutate({ id, payload }, { onSuccess: () => setEditPeer(null) })
  }

  function handleConfirmDelete() {
    if (!deletePeer) return
    deleteMutation.mutate(deletePeer.id, { onSuccess: () => setDeletePeer(null) })
  }

  function handleToggleActive(peer: PeerBank) {
    updateMutation.mutate({ id: peer.id, payload: { active: !peer.active } })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Peer Banks</h1>
        <Button onClick={() => setCreateOpen(true)}>Add Peer Bank</Button>
      </div>
      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        Banks our bank exchanges interbank traffic with. Each entry is the base URL of a peer
        bank&apos;s API plus the credentials used to authenticate to it. Disabling a peer
        immediately stops both inbound and outbound traffic without losing the configuration.
      </p>

      {isLoading ? (
        <LoadingSpinner />
      ) : peerBanks.length ? (
        <PeerBanksTable
          peerBanks={peerBanks}
          onEdit={setEditPeer}
          onDelete={setDeletePeer}
          onToggleActive={handleToggleActive}
        />
      ) : (
        <p>No peer banks configured.</p>
      )}

      <CreatePeerBankDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />

      <EditPeerBankDialog
        open={editPeer !== null}
        peerBank={editPeer}
        onClose={() => setEditPeer(null)}
        onSave={handleSave}
        loading={updateMutation.isPending}
      />

      <Dialog
        open={deletePeer !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeletePeer(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Peer Bank</DialogTitle>
          </DialogHeader>
          <p>
            Remove peer bank &quot;{deletePeer?.bank_code}&quot; ({deletePeer?.base_url})? This
            permanently deletes its credentials. Disable it instead if you may need to re-enable
            later.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePeer(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
