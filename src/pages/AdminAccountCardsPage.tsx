import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccountCards, useBlockCard, useUnblockCard, useDeactivateCard } from '@/hooks/useCards'
import { useAccount } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/button'
import { AdminCardItem } from '@/components/admin/AdminCardItem'
import { CreateCardDialog } from '@/components/admin/CreateCardDialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

export function AdminAccountCardsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id)
  const { data: account } = useAccount(accountId)
  const { data: cards, isLoading } = useAccountCards(account?.account_number ?? '')
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/accounts')}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">Cards — {account?.account_name ?? 'Account'}</h1>
        </div>
        <Button onClick={() => setCreateCardOpen(true)}>Create Card</Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
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
        <p className="text-muted-foreground">No cards for this account.</p>
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
    </div>
  )
}
