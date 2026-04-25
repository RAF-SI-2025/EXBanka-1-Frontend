import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SecurityInfoPanel } from '@/components/securities/SecurityInfoPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useOption, useExerciseOption } from '@/hooks/useSecurities'

export function OptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const optionId = Number(id) || 0
  const [exerciseResult, setExerciseResult] = useState<string | null>(null)

  const { data: option, isLoading } = useOption(optionId)
  const exerciseMutation = useExerciseOption()

  if (isLoading) return <LoadingSpinner />
  if (!option) return <p>Option not found.</p>

  const infoEntries = [
    { label: 'Ticker', value: option.ticker },
    { label: 'Name', value: option.name },
    { label: 'Type', value: option.option_type === 'call' ? 'Call' : 'Put' },
    { label: 'Strike Price', value: option.strike_price },
    { label: 'Premium', value: option.premium },
    { label: 'Settlement Date', value: option.settlement_date },
    { label: 'Implied Volatility', value: option.implied_volatility },
    { label: 'Open Interest', value: (option.open_interest ?? 0).toLocaleString() },
    { label: 'Price', value: option.price },
    { label: 'Bid', value: option.bid },
    { label: 'Ask', value: option.ask },
    { label: 'Volume', value: (option.volume ?? 0).toLocaleString() },
  ]

  const handleExercise = () => {
    exerciseMutation.mutate(optionId, {
      onSuccess: (result) => {
        setExerciseResult(
          `Exercised ${result.exercised_quantity} contracts. Profit: ${result.profit}`
        )
      },
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{option.ticker}</h1>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              navigate(
                `/securities/order/new?optionId=${optionId}&direction=buy&securityType=option`
              )
            }
          >
            Buy
          </Button>
          <Button variant="outline" onClick={handleExercise} disabled={exerciseMutation.isPending}>
            Exercise
          </Button>
        </div>
      </div>

      {exerciseResult && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          {exerciseResult}
        </div>
      )}

      <SecurityInfoPanel entries={infoEntries} />
    </div>
  )
}
