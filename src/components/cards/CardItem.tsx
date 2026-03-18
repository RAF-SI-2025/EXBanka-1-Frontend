import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { maskCardNumber, formatAccountNumber } from '@/lib/utils/format'
import type { Card as CardType } from '@/types/card'

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

interface CardItemProps {
  card: CardType
  onBlock: (cardId: number) => void
  accountName?: string
}

export function CardItem({ card, onBlock, accountName }: CardItemProps) {
  return (
    <Card>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="space-y-1">
          <p className="font-mono text-lg">{maskCardNumber(card.card_number)}</p>
          <p className="text-sm text-muted-foreground">
            {accountName && `${accountName} — `}
            {formatAccountNumber(card.account_number)}
          </p>
          <p className="text-sm">
            {card.card_name} • {card.brand}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[card.status] ?? 'secondary'}>
            {STATUS_LABELS[card.status] ?? card.status}
          </Badge>
          {card.status === 'ACTIVE' && (
            <Button variant="destructive" size="sm" onClick={() => onBlock(card.id)}>
              Blokiraj
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
