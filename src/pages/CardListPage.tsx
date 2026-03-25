import { useState } from 'react'
import { useCards, useBlockCard } from '@/hooks/useCards'
import { CardGrid } from '@/components/cards/CardGrid'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function CardListPage() {
  const navigate = useNavigate()
  const { data: cards, isLoading, error } = useCards()
  const blockCard = useBlockCard()
  const [blockingCardId, setBlockingCardId] = useState<number | null>(null)

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">Error loading cards. Please try again.</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cards</h1>
        <Button onClick={() => navigate('/cards/request')}>Request Card</Button>
      </div>
      <CardGrid cards={cards ?? []} onBlock={(id) => setBlockingCardId(id)} />

      <Dialog open={blockingCardId !== null} onOpenChange={() => setBlockingCardId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Card?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to block this card? You will need to contact the bank to unblock
            it.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockingCardId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={blockCard.isPending}
              onClick={() => {
                if (blockingCardId !== null) {
                  blockCard.mutate(blockingCardId, {
                    onSuccess: () => setBlockingCardId(null),
                  })
                }
              }}
            >
              {blockCard.isPending ? 'Blocking...' : 'Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
