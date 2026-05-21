import { useState } from 'react'
import { useCards, useTemporaryBlockCard } from '@/hooks/useCards'
import { useClientMe } from '@/hooks/useClients'
import { useClientAccounts } from '@/hooks/useAccounts'
import { CardGrid } from '@/views/cards/components/CardGrid'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SetCardPinDialog } from '@/views/cards/components/SetCardPinDialog'
import { VerifyCardPinDialog } from '@/views/cards/components/VerifyCardPinDialog'
import { CreateVirtualCardDialog } from '@/views/cards/components/CreateVirtualCardDialog'
import type { Card as CardModel } from '@/types/card'
import { ErrorState, LoadingState, ViewShell } from '@/views/shared'

export function CardListView() {
  const navigate = useNavigate()
  const { data: cards, isLoading, error } = useCards()
  const { data: client } = useClientMe()
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const temporaryBlock = useTemporaryBlockCard()
  const [blockingCardId, setBlockingCardId] = useState<number | null>(null)
  const [setPinCardId, setSetPinCardId] = useState<number | null>(null)
  const [showPinCard, setShowPinCard] = useState<CardModel | null>(null)
  const [virtualOpen, setVirtualOpen] = useState(false)
  const holderName = client ? `${client.first_name} ${client.last_name}` : undefined

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (error) {
    return (
      <ViewShell title="Cards">
        <ErrorState message="Error loading cards. Please try again." />
      </ViewShell>
    )
  }

  return (
    <ViewShell
      title="Cards"
      subtitle="Your physical and virtual cards. Manage PINs, request new cards, or block lost ones."
      actions={
        <>
          <Button variant="outline" onClick={() => setVirtualOpen(true)} disabled={!client}>
            Create Virtual Card
          </Button>
          <Button onClick={() => navigate('/cards/request')}>Request Card</Button>
        </>
      }
    >
      <CardGrid
        cards={cards ?? []}
        onBlock={(id) => setBlockingCardId(id)}
        onSetPin={(id) => setSetPinCardId(id)}
        onShowPin={(card) => setShowPinCard(card)}
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

      {showPinCard !== null && (
        <VerifyCardPinDialog
          open
          onOpenChange={(o) => !o && setShowPinCard(null)}
          card={showPinCard}
        />
      )}

      {virtualOpen && client && (
        <CreateVirtualCardDialog
          open
          onOpenChange={setVirtualOpen}
          accounts={accounts}
          ownerId={client.id}
        />
      )}
    </ViewShell>
  )
}
