import { CardItem } from './CardItem'
import type { Card } from '@/types/card'

interface CardGridProps {
  cards: Card[]
  onBlock: (cardId: number) => void
  onSetPin?: (cardId: number) => void
  onShowPin?: (card: Card) => void
  accountNames?: Record<string, string>
  holderName?: string
}

export function CardGrid({
  cards,
  onBlock,
  onSetPin,
  onShowPin,
  accountNames,
  holderName,
}: CardGridProps) {
  if (cards.length === 0) {
    return <p className="text-muted-foreground">You have no cards.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onBlock={onBlock}
          onSetPin={onSetPin}
          onShowPin={onShowPin}
          accountName={accountNames?.[card.account_number]}
          holderName={holderName}
        />
      ))}
    </div>
  )
}
