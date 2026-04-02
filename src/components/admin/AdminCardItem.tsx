import type { Card } from '@/types/card'
import { CardVisual } from '@/components/cards/CardVisual'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CARD_STATUS_LABELS, CARD_STATUS_VARIANT } from '@/lib/constants/banking'

interface AdminCardItemProps {
  card: Card
  onBlock: (id: number) => void
  onUnblock: (id: number) => void
  onDeactivate: (id: number) => void
}

export function AdminCardItem({ card, onBlock, onUnblock, onDeactivate }: AdminCardItemProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <CardVisual card={card} />
      <div className="flex items-center gap-3 w-full max-w-sm justify-between">
        <Badge variant={CARD_STATUS_VARIANT[card.status] ?? 'secondary'}>
          {CARD_STATUS_LABELS[card.status] ?? card.status}
        </Badge>
        <div className="flex gap-2">
          {card.status === 'ACTIVE' && (
            <Button size="sm" variant="destructive" onClick={() => onBlock(card.id)}>
              Block
            </Button>
          )}
          {card.status === 'BLOCKED' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onUnblock(card.id)}>
                Unblock
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDeactivate(card.id)}>
                Deactivate
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
