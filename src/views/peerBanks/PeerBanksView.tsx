import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreatePeerBankDialog } from '@/views/peerBanks/components/CreatePeerBankDialog'
import { EditPeerBankDialog } from '@/views/peerBanks/components/EditPeerBankDialog'
import { PeerBanksTable } from '@/views/peerBanks/components/PeerBanksTable'
import { RemovePeerBankDialog } from '@/views/peerBanks/components/RemovePeerBankDialog'
import {
  useCreatePeerBank,
  useDeletePeerBank,
  usePeerBanks,
  useUpdatePeerBank,
} from '@/views/peerBanks/hooks/usePeerBanks'
import type {
  CreatePeerBankPayload,
  PeerBank,
  UpdatePeerBankPayload,
} from '@/views/peerBanks/types'
import { EmptyState, ErrorState, LoadingState, ViewShell } from '@/views/shared'

export function PeerBanksView() {
  const { data, isLoading, error } = usePeerBanks()
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
    <ViewShell
      title="Peer Banks"
      subtitle="Banks our bank exchanges interbank traffic with. Each entry is the base URL of a peer bank’s API plus the credentials used to authenticate to it. Disabling a peer immediately stops both inbound and outbound traffic without losing the configuration."
      actions={<Button onClick={() => setCreateOpen(true)}>Add Peer Bank</Button>}
    >
      <Card>
        <CardContent className="pt-6">
          {isLoading && <LoadingState />}
          {error && <ErrorState message="Could not load peer banks." />}
          {!isLoading && !error && peerBanks.length === 0 && (
            <EmptyState
              title="No peer banks configured."
              hint="Add a peer bank to enable interbank traffic."
            />
          )}
          {!isLoading && !error && peerBanks.length > 0 && (
            <PeerBanksTable
              peerBanks={peerBanks}
              onEdit={setEditPeer}
              onDelete={setDeletePeer}
              onToggleActive={handleToggleActive}
            />
          )}
        </CardContent>
      </Card>

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

      <RemovePeerBankDialog
        peer={deletePeer}
        loading={deleteMutation.isPending}
        onCancel={() => setDeletePeer(null)}
        onConfirm={handleConfirmDelete}
      />
    </ViewShell>
  )
}
