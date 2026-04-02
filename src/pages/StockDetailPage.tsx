import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PriceChart } from '@/components/securities/PriceChart'
import { SecurityInfoPanel } from '@/components/securities/SecurityInfoPanel'
import { OptionsChain } from '@/components/securities/OptionsChain'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useStock, useStockHistory, useOptions } from '@/hooks/useSecurities'
import type { PriceHistoryPeriod } from '@/types/security'

export function StockDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const stockId = Number(id) || 0
  const [period, setPeriod] = useState<PriceHistoryPeriod>('month')
  const [optionDate, setOptionDate] = useState('')

  const { data: stock, isLoading } = useStock(stockId)
  const { data: history, isLoading: historyLoading } = useStockHistory(stockId, { period })
  const { data: optionsData } = useOptions({
    stock_id: stockId,
    settlement_date: optionDate || undefined,
  })

  if (isLoading) return <LoadingSpinner />
  if (!stock) return <p>Stock not found.</p>

  const infoEntries = [
    { label: 'Ticker', value: stock.ticker },
    { label: 'Name', value: stock.name },
    { label: 'Price', value: stock.price },
    { label: 'Change', value: stock.change },
    { label: 'Volume', value: stock.volume.toLocaleString() },
    { label: 'Exchange', value: stock.exchange_acronym },
    { label: 'Market Cap', value: stock.market_cap },
    { label: 'Dividend Yield', value: `${(stock.dividend_yield * 100).toFixed(2)}%` },
    { label: 'Maintenance Margin', value: stock.maintenance_margin },
    { label: 'Initial Margin Cost', value: stock.initial_margin_cost },
  ]

  const calls = optionsData?.options.filter((o) => o.option_type === 'call') ?? []
  const puts = optionsData?.options.filter((o) => o.option_type === 'put') ?? []
  const settlementDates = [...new Set(optionsData?.options.map((o) => o.settlement_date) ?? [])]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {stock.ticker} — {stock.name}
        </h1>
        <Button
          onClick={() => navigate(`/securities/order/new?listingId=${stock.id}&direction=buy`)}
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

      {settlementDates.length > 0 && (
        <div className="mt-8">
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
    </div>
  )
}
