import { useParams, useNavigate } from 'react-router-dom'
import { useAccountCards, useBlockCard, useUnblockCard, useDeactivateCard } from '@/hooks/useCards'
import { useAccount } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { maskCardNumber } from '@/lib/utils/format'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktivna',
  BLOCKED: 'Blokirana',
  DEACTIVATED: 'Deaktivirana',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  BLOCKED: 'secondary',
  DEACTIVATED: 'destructive',
}

export function AdminAccountCardsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id)
  const { data: account } = useAccount(accountId)
  const { data: cards, isLoading } = useAccountCards(accountId)
  const blockCard = useBlockCard()
  const unblockCard = useUnblockCard()
  const deactivateCard = useDeactivateCard()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/accounts')}>
          ← Nazad
        </Button>
        <h1 className="text-2xl font-bold">Kartice — {account?.name ?? 'Račun'}</h1>
      </div>

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : cards && cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-mono text-lg">{maskCardNumber(card.card_number)}</p>
                  <p className="text-sm text-muted-foreground">{card.owner_name}</p>
                  <p className="text-sm">
                    {card.card_name} • {card.brand}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[card.status] ?? 'secondary'}>
                    {STATUS_LABELS[card.status] ?? card.status}
                  </Badge>
                  {card.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => blockCard.mutate(card.id)}
                    >
                      Blokiraj
                    </Button>
                  )}
                  {card.status === 'BLOCKED' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unblockCard.mutate(card.id)}
                      >
                        Odblokiraj
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deactivateCard.mutate(card.id)}
                      >
                        Deaktiviraj
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nema kartica za ovaj račun.</p>
      )}
    </div>
  )
}
