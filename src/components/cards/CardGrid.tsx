import { CardItem } from './CardItem'
import type { Card } from '@/types/card'

interface CardGridProps {
  cards: Card[]
  onBlock: (cardId: number) => void
  accountNames?: Record<string, string>
}

export function CardGrid({ cards, onBlock, accountNames }: CardGridProps) {
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
          accountName={accountNames?.[card.account_number]}
        />
      ))}
    </div>
  )
}
