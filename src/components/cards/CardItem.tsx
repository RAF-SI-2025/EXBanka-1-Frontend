import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardVisual } from './CardVisual'
import { formatAccountNumber } from '@/lib/utils/format'
import { CARD_STATUS_LABELS, CARD_STATUS_VARIANT } from '@/lib/constants/banking'
import type { Card as CardType } from '@/types/card'

interface CardItemProps {
  card: CardType
  onBlock: (cardId: number) => void
  onSetPin?: (cardId: number) => void
  onShowPin?: (card: CardType) => void
  accountName?: string
  holderName?: string
}

export function CardItem({
  card,
  onBlock,
  onSetPin,
  onShowPin,
  accountName,
  holderName,
}: CardItemProps) {
  const status = card.status?.toUpperCase() as CardType['status']
  return (
    <div className="flex flex-col items-center gap-3">
      <CardVisual card={card} holderName={holderName} />
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={CARD_STATUS_VARIANT[status] ?? 'secondary'}>
            {CARD_STATUS_LABELS[status] ?? card.status}
          </Badge>
          {accountName && (
            <span className="text-xs text-muted-foreground truncate">
              {accountName} — {formatAccountNumber(card.account_number)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {onShowPin && (
            <Button variant="outline" size="sm" onClick={() => onShowPin(card)}>
              Show details
            </Button>
          )}
          {onSetPin && (
            <Button variant="outline" size="sm" onClick={() => onSetPin(card.id)}>
              Set PIN
            </Button>
          )}
          {status === 'ACTIVE' && (
            <Button variant="destructive" size="sm" onClick={() => onBlock(card.id)}>
              Block
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
