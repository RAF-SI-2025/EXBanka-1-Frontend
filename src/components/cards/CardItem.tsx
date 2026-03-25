import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardVisual } from './CardVisual'
import { formatAccountNumber } from '@/lib/utils/format'
import { CARD_STATUS_LABELS, CARD_STATUS_VARIANT } from '@/lib/constants/banking'
import type { Card as CardType } from '@/types/card'

interface CardItemProps {
  card: CardType
  onBlock: (cardId: number) => void
  accountName?: string
}

export function CardItem({ card, onBlock, accountName }: CardItemProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <CardVisual card={card} />
      <div className="flex items-center gap-3 w-full max-w-sm justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={CARD_STATUS_VARIANT[card.status] ?? 'secondary'}>
            {CARD_STATUS_LABELS[card.status] ?? card.status}
          </Badge>
          {accountName && (
            <span className="text-xs text-muted-foreground">
              {accountName} — {formatAccountNumber(card.account_number)}
            </span>
          )}
        </div>
        {card.status === 'ACTIVE' && (
          <Button variant="destructive" size="sm" onClick={() => onBlock(card.id)}>
            Block
          </Button>
        )}
      </div>
    </div>
  )
}
