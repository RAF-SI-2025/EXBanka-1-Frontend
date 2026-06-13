import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useOptions, useStock, useStockHistory } from '@/hooks/useSecurities'
import { selectUserType } from '@/store/selectors/authSelectors'
import type { PriceHistoryPeriod } from '@/types/security'
import { OptionsChain } from '@/views/securities/components/OptionsChain'
import { PriceChart } from '@/views/securities/components/PriceChart'
import { SecurityInfoPanel } from '@/views/securities/components/SecurityInfoPanel'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function StockDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const stockId = Number(id) || 0
  const [period, setPeriod] = useState<PriceHistoryPeriod>('month')
  const [optionDate, setOptionDate] = useState('')

  // GET /securities/options is an employee-only route; a client opening this
  // page must not trigger it (403). Clients simply don't see the options chain.
  const isClient = useAppSelector(selectUserType) === 'client'

  const { data: stock, isLoading } = useStock(stockId)
  const { data: history, isLoading: historyLoading } = useStockHistory(stockId, { period })
  const { data: optionsData } = useOptions(
    { stock_id: stockId, settlement_date: optionDate || undefined },
    !isClient
  )

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (!stock) {
    return (
      <ViewShell title="Stock">
        <EmptyState title="Stock not found." />
      </ViewShell>
    )
  }

  const infoEntries = [
    { label: 'Ticker', value: stock.ticker },
    { label: 'Name', value: stock.name },
    { label: 'Price', value: stock.price },
    { label: 'Change', value: stock.change },
    { label: 'Volume', value: (stock.volume ?? 0).toLocaleString() },
    { label: 'Exchange', value: stock.exchange_acronym },
    { label: 'Market Cap', value: stock.market_cap },
    { label: 'Dividend Yield', value: `${((stock.dividend_yield ?? 0) * 100).toFixed(2)}%` },
    { label: 'Maintenance Margin', value: stock.maintenance_margin },
    { label: 'Initial Margin Cost', value: stock.initial_margin_cost },
  ]

  const calls = optionsData?.options.filter((o) => o.option_type === 'call') ?? []
  const puts = optionsData?.options.filter((o) => o.option_type === 'put') ?? []
  const settlementDates = [...new Set(optionsData?.options.map((o) => o.settlement_date) ?? [])]

  return (
    <ViewShell
      title={`${stock.ticker} — ${stock.name}`}
      actions={
        <Button
          onClick={() =>
            navigate(
              `/securities/order/new?listingId=${stock.listing_id ?? stock.id}&direction=buy`
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

      {settlementDates.length > 0 && (
        <div className="mt-2">
          <h2 className="text-xl font-bold mb-4">Options Chain</h2>
          <OptionsChain
            calls={calls}
            puts={puts}
            sharedPrice={Number(stock.price)}
            settlementDates={settlementDates}
            selectedDate={optionDate || settlementDates[0]}
            onDateChange={setOptionDate}
          />
        </div>
      )}
    </ViewShell>
  )
}
