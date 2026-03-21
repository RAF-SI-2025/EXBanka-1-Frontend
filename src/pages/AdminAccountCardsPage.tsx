import { useParams, useNavigate } from 'react-router-dom'
import { useAccountCards, useBlockCard, useUnblockCard, useDeactivateCard } from '@/hooks/useCards'
import { useAccount } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/button'
import { AdminCardItem } from '@/components/admin/AdminCardItem'

export function AdminAccountCardsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id)
  const { data: account } = useAccount(accountId)
  const { data: cards, isLoading } = useAccountCards(account?.account_number ?? '')
  const blockCard = useBlockCard()
  const unblockCard = useUnblockCard()
  const deactivateCard = useDeactivateCard()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/accounts')}>
          ← Nazad
        </Button>
        <h1 className="text-2xl font-bold">Kartice — {account?.account_name ?? 'Račun'}</h1>
      </div>

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : cards && cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => (
            <AdminCardItem
              key={card.id}
              card={card}
              onBlock={(cardId) => blockCard.mutate(cardId)}
              onUnblock={(cardId) => unblockCard.mutate(cardId)}
              onDeactivate={(cardId) => deactivateCard.mutate(cardId)}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nema kartica za ovaj račun.</p>
      )}
    </div>
  )
}
