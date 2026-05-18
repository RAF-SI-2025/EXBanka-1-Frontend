import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useFuture, useFutureHistory } from '@/hooks/useSecurities'
import type { PriceHistoryPeriod } from '@/types/security'
import { PriceChart } from '@/views/securities/components/PriceChart'
import { SecurityInfoPanel } from '@/views/securities/components/SecurityInfoPanel'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function FuturesDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const futureId = Number(id) || 0
  const [period, setPeriod] = useState<PriceHistoryPeriod>('month')

  const { data: future, isLoading } = useFuture(futureId)
  const { data: history, isLoading: historyLoading } = useFutureHistory(futureId, { period })

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (!future) {
    return (
      <ViewShell title="Futures contract">
        <EmptyState title="Futures contract not found." />
      </ViewShell>
    )
  }

  const infoEntries = [
    { label: 'Ticker', value: future.ticker },
    { label: 'Name', value: future.name },
    { label: 'Price', value: future.price },
    { label: 'Change', value: future.change },
    { label: 'Volume', value: (future.volume ?? 0).toLocaleString() },
    { label: 'Exchange', value: future.exchange_acronym },
    { label: 'Contract Size', value: `${future.contract_size} ${future.contract_unit}` },
    { label: 'Settlement Date', value: future.settlement_date },
    { label: 'Maintenance Margin', value: future.maintenance_margin },
    { label: 'Initial Margin Cost', value: future.initial_margin_cost },
  ]

  return (
    <ViewShell
      title={`${future.ticker} — ${future.name}`}
      actions={
        <Button
          onClick={() =>
            navigate(
              `/securities/order/new?listingId=${future.listing_id ?? future.id}&direction=buy`
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
