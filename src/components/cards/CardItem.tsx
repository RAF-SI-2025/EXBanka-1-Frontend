import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CardVisual } from './CardVisual'
import { formatAccountNumber } from '@/lib/utils/format'
import { CARD_STATUS_LABELS } from '@/lib/constants/banking'
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
      <div className="w-full max-w-sm space-y-2">
        {accountName && (
          <p className="text-xs text-muted-foreground truncate">
            {accountName} — {formatAccountNumber(card.account_number)}
          </p>
        )}
        <div className="flex items-center flex-wrap gap-2">
          <StatusBadge status={status}>{CARD_STATUS_LABELS[status] ?? card.status}</StatusBadge>
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
