import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccountCards, useBlockCard, useUnblockCard, useDeactivateCard } from '@/hooks/useCards'
import { useAccount } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/button'
import { AdminCardItem } from '@/views/accounts/components/AdminCardItem'
import { CreateCardDialog } from '@/views/accounts/components/CreateCardDialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

type PendingAction = { type: 'block' | 'unblock' | 'deactivate'; cardId: number } | null

const ACTION_TEXT: Record<string, { title: string; desc: string; confirm: string }> = {
  block: {
    title: 'Block Card?',
    desc: 'Are you sure you want to block this card?',
    confirm: 'Block',
  },
  unblock: {
    title: 'Unblock Card?',
    desc: 'Are you sure you want to unblock this card?',
    confirm: 'Unblock',
  },
  deactivate: {
    title: 'Permanently Deactivate Card?',
    desc: 'This action is permanent. The card cannot be reactivated.',
    confirm: 'Deactivate',
  },
}

export function AdminAccountCardsView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id)
  const { data: account } = useAccount(accountId)
  const { data: cards, isLoading } = useAccountCards(accountId)
  const blockCard = useBlockCard()
  const unblockCard = useUnblockCard()
  const deactivateCard = useDeactivateCard()
  const [pending, setPending] = useState<PendingAction>(null)
  const [createCardOpen, setCreateCardOpen] = useState(false)

  const isPending = blockCard.isPending || unblockCard.isPending || deactivateCard.isPending

  const handleConfirm = () => {
    if (!pending) return
    const mutation = { block: blockCard, unblock: unblockCard, deactivate: deactivateCard }[
      pending.type
    ]
    mutation.mutate(pending.cardId, { onSuccess: () => setPending(null) })
  }

  const text = pending ? ACTION_TEXT[pending.type] : null

  return (
    <ViewShell
      title={
        <span className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/accounts')}>
            ← Back
          </Button>
          Cards — {account?.account_name ?? 'Account'}
        </span>
      }
      actions={<Button onClick={() => setCreateCardOpen(true)}>Create Card</Button>}
    >
      {isLoading ? (
        <LoadingState />
      ) : cards && cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => (
            <AdminCardItem
              key={card.id}
              card={card}
              onBlock={(cardId) => setPending({ type: 'block', cardId })}
              onUnblock={(cardId) => setPending({ type: 'unblock', cardId })}
              onDeactivate={(cardId) => setPending({ type: 'deactivate', cardId })}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No cards for this account." />
      )}

      <Dialog open={pending !== null} onOpenChange={() => setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{text?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{text?.desc}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isPending} onClick={handleConfirm}>
              {isPending ? 'Processing...' : text?.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateCardDialog open={createCardOpen} onClose={() => setCreateCardOpen(false)} />
    </ViewShell>
  )
}
