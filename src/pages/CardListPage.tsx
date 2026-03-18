import { useCards, useBlockCard } from '@/hooks/useCards'
import { CardGrid } from '@/components/cards/CardGrid'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function CardListPage() {
  const navigate = useNavigate()
  const { data: cards, isLoading } = useCards()
  const blockCard = useBlockCard()

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kartice</h1>
        <Button onClick={() => navigate('/cards/request')}>Zatraži karticu</Button>
      </div>
      <CardGrid cards={cards ?? []} onBlock={(id) => blockCard.mutate(id)} />
    </div>
  )
}
