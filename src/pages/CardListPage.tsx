import { useState } from 'react'
import { useCards, useTemporaryBlockCard } from '@/hooks/useCards'
import { useClientMe } from '@/hooks/useClients'
import { useClientAccounts } from '@/hooks/useAccounts'
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
import { SetCardPinDialog } from '@/components/cards/SetCardPinDialog'
import { VerifyCardPinDialog } from '@/components/cards/VerifyCardPinDialog'
import { CreateVirtualCardDialog } from '@/components/cards/CreateVirtualCardDialog'
import type { Card as CardModel } from '@/types/card'

export function CardListPage() {
  const navigate = useNavigate()
  const { data: cards, isLoading, error } = useCards()
  const { data: client } = useClientMe()
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const temporaryBlock = useTemporaryBlockCard()
  const [blockingCardId, setBlockingCardId] = useState<number | null>(null)
  const [setPinCardId, setSetPinCardId] = useState<number | null>(null)
  const [pinCard, setPinCard] = useState<CardModel | null>(null)
  const [virtualOpen, setVirtualOpen] = useState(false)
  const holderName = client ? `${client.first_name} ${client.last_name}` : undefined

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">Error loading cards. Please try again.</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Cards</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setVirtualOpen(true)} disabled={!client}>
            Create Virtual Card
          </Button>
          <Button onClick={() => navigate('/cards/request')}>Request Card</Button>
        </div>
      </div>
      <CardGrid
        cards={cards ?? []}
        onBlock={(id) => setBlockingCardId(id)}
        onSetPin={(id) => setSetPinCardId(id)}
        onShowPin={(card) => setPinCard(card)}
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

      {setPinCardId !== null && (
        <SetCardPinDialog
          open
          onOpenChange={(o) => !o && setSetPinCardId(null)}
          cardId={setPinCardId}
        />
      )}

      {pinCard !== null && (
        <VerifyCardPinDialog open onOpenChange={(o) => !o && setPinCard(null)} card={pinCard} />
      )}

      {virtualOpen && client && (
        <CreateVirtualCardDialog
          open
          onOpenChange={setVirtualOpen}
          accounts={accounts}
          ownerId={client.id}
        />
      )}
    </div>
  )
}
