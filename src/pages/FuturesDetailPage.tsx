import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PriceChart } from '@/components/securities/PriceChart'
import { SecurityInfoPanel } from '@/components/securities/SecurityInfoPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useFuture, useFutureHistory } from '@/hooks/useSecurities'
import type { PriceHistoryPeriod } from '@/types/security'

export function FuturesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const futureId = Number(id) || 0
  const [period, setPeriod] = useState<PriceHistoryPeriod>('month')

  const { data: future, isLoading } = useFuture(futureId)
  const { data: history, isLoading: historyLoading } = useFutureHistory(futureId, { period })

  if (isLoading) return <LoadingSpinner />
  if (!future) return <p>Futures contract not found.</p>

  const infoEntries = [
    { label: 'Ticker', value: future.ticker },
    { label: 'Name', value: future.name },
    { label: 'Price', value: future.price },
    { label: 'Change', value: future.change },
    { label: 'Volume', value: future.volume.toLocaleString() },
    { label: 'Exchange', value: future.exchange_acronym },
    { label: 'Contract Size', value: `${future.contract_size} ${future.contract_unit}` },
    { label: 'Settlement Date', value: future.settlement_date },
    { label: 'Maintenance Margin', value: future.maintenance_margin },
    { label: 'Initial Margin Cost', value: future.initial_margin_cost },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {future.ticker} — {future.name}
        </h1>
        <Button
          onClick={() => navigate(`/securities/order/new?listingId=${future.id}&direction=buy`)}
        >
          Buy
        </Button>
      </div>

      <PriceChart
        data={history?.history ?? []}
        selectedPeriod={period}
        onPeriodChange={setPeriod}
        isLoading={historyLoading}
      />

      <div className="mt-6">
        <SecurityInfoPanel entries={infoEntries} />
      </div>
    </div>
  )
}
