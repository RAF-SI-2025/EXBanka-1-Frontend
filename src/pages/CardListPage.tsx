import { useState } from 'react'
import { useCards, useTemporaryBlockCard } from '@/hooks/useCards'
import { useClientMe } from '@/hooks/useClients'
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
  const { data: client } = useClientMe()
  const temporaryBlock = useTemporaryBlockCard()
  const [blockingCardId, setBlockingCardId] = useState<number | null>(null)
  const holderName = client ? `${client.first_name} ${client.last_name}` : undefined

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">Error loading cards. Please try again.</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cards</h1>
        <Button onClick={() => navigate('/cards/request')}>Request Card</Button>
      </div>
      <CardGrid
        cards={cards ?? []}
        onBlock={(id) => setBlockingCardId(id)}
        holderName={holderName}
      />

      <Dialog open={blockingCardId !== null} onOpenChange={() => setBlockingCardId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporarily Block Card?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to temporarily block this card for 12 hours? The card will be
            automatically unblocked after the period expires.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockingCardId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={temporaryBlock.isPending}
              onClick={() => {
                if (blockingCardId !== null) {
                  temporaryBlock.mutate(
                    { cardId: blockingCardId, durationHours: 12 },
                    { onSuccess: () => setBlockingCardId(null) }
                  )
                }
              }}
            >
              {temporaryBlock.isPending ? 'Blocking...' : 'Block for 12 Hours'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
