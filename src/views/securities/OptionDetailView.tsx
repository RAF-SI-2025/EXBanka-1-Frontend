import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useExerciseOption, useOption } from '@/hooks/useSecurities'
import { SecurityInfoPanel } from '@/views/securities/components/SecurityInfoPanel'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function OptionDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const optionId = Number(id) || 0
  const [exerciseResult, setExerciseResult] = useState<string | null>(null)

  const { data: option, isLoading } = useOption(optionId)
  const exerciseMutation = useExerciseOption()

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (!option) {
    return (
      <ViewShell title="Option">
        <EmptyState title="Option not found." />
      </ViewShell>
    )
  }

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
    <ViewShell
      title={option.ticker}
      actions={
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
      }
    >
      {exerciseResult && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200 animate-in fade-in slide-in-from-top-1 duration-200">
          {exerciseResult}
        </div>
      )}

      <SecurityInfoPanel entries={infoEntries} />
    </ViewShell>
  )
}
