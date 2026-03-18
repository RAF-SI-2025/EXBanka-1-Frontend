import { CardItem } from './CardItem'
import type { Card } from '@/types/card'

interface CardGridProps {
  cards: Card[]
  onBlock: (cardId: number) => void
  accountNames?: Record<string, string>
}

export function CardGrid({ cards, onBlock, accountNames }: CardGridProps) {
  if (cards.length === 0) {
    return <p className="text-muted-foreground">Nemate kartice.</p>
  }

  return (
    <div className="space-y-3">
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
