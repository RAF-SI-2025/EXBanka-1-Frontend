import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ClientFundPosition } from '@/types/fund'

interface MyFundsListProps {
  positions: ClientFundPosition[]
  onInvest: (position: ClientFundPosition) => void
  onRedeem: (position: ClientFundPosition) => void
}

export function MyFundsList({ positions, onInvest, onRedeem }: MyFundsListProps) {
  const navigate = useNavigate()

  if (positions.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no positions in any fund yet.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {positions.map((position) => (
        <Card key={position.fund_id} className="cursor-pointer hover:ring-1 hover:ring-accent-2">
          <CardHeader onClick={() => navigate(`/funds/${position.fund_id}`)}>
            <CardTitle>{position.fund_name}</CardTitle>
            <p className="text-xs text-muted-foreground">Share: {position.percentage_fund}%</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current value</span>
              <span className="font-medium">{position.current_value_rsd} RSD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profit</span>
              <span className="font-medium">{position.profit_rsd} RSD</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => onInvest(position)}>
                Invest
              </Button>
              <Button size="sm" variant="outline" onClick={() => onRedeem(position)}>
                Redeem
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
