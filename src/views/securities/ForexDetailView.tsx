import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useForexHistory, useForexPair } from '@/hooks/useSecurities'
import type { PriceHistoryPeriod } from '@/types/security'
import { PriceChart } from '@/views/securities/components/PriceChart'
import { SecurityInfoPanel } from '@/views/securities/components/SecurityInfoPanel'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function ForexDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const forexId = Number(id) || 0
  const [period, setPeriod] = useState<PriceHistoryPeriod>('month')

  const { data: pair, isLoading } = useForexPair(forexId)
  const { data: history, isLoading: historyLoading } = useForexHistory(forexId, { period })

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (!pair) {
    return (
      <ViewShell title="Forex pair">
        <EmptyState title="Forex pair not found." />
      </ViewShell>
    )
  }

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
    <ViewShell
      title={`${pair.ticker} — ${pair.name}`}
      actions={
        <Button
          onClick={() =>
            navigate(
              `/securities/order/new?listingId=${pair.listing_id ?? pair.id}&direction=buy&securityType=forex`
            )
          }
        >
          Buy
        </Button>
      }
    >
      <PriceChart
        data={history?.history ?? []}
        selectedPeriod={period}
        onPeriodChange={setPeriod}
        isLoading={historyLoading}
      />

      <SecurityInfoPanel entries={infoEntries} />
    </ViewShell>
  )
}
