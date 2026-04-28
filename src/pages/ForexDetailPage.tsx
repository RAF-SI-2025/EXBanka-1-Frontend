import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PriceChart } from '@/components/securities/PriceChart'
import { SecurityInfoPanel } from '@/components/securities/SecurityInfoPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useForexPair, useForexHistory } from '@/hooks/useSecurities'
import type { PriceHistoryPeriod } from '@/types/security'

export function ForexDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const forexId = Number(id) || 0
  const [period, setPeriod] = useState<PriceHistoryPeriod>('month')

  const { data: pair, isLoading } = useForexPair(forexId)
  const { data: history, isLoading: historyLoading } = useForexHistory(forexId, { period })

  if (isLoading) return <LoadingSpinner />
  if (!pair) return <p>Forex pair not found.</p>

  const infoEntries = [
    { label: 'Ticker', value: pair.ticker },
    { label: 'Name', value: pair.name },
    { label: 'Exchange Rate', value: pair.exchange_rate },
    { label: 'Change', value: pair.change },
    { label: 'Volume', value: (pair.volume ?? 0).toLocaleString() },
    { label: 'Base Currency', value: pair.base_currency },
    { label: 'Quote Currency', value: pair.quote_currency },
    { label: 'Liquidity', value: pair.liquidity },
    { label: 'Maintenance Margin', value: pair.maintenance_margin },
    { label: 'Initial Margin Cost', value: pair.initial_margin_cost },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {pair.ticker} — {pair.name}
        </h1>
        <Button
          onClick={() =>
            navigate(
              `/securities/order/new?listingId=${pair.listing_id ?? pair.id}&direction=buy&securityType=forex`
            )
          }
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
