import { useState } from 'react'
import { usePortfolio, usePortfolioSummary } from '@/hooks/usePortfolio'
import { useCreateOrder } from '@/hooks/useOrders'
import { useTradingAccounts } from '@/hooks/useAccounts'
import { HoldingsTable } from '@/components/portfolio/HoldingsTable'
import { SellOrderDialog } from '@/components/portfolio/SellOrderDialog'
import type { Holding } from '@/types/portfolio'

export function PortfolioPage() {
  const { data, isLoading } = usePortfolio()
  const { data: summary } = usePortfolioSummary()
  const { data: accountsData } = useTradingAccounts()
  const { mutate: createOrder, isPending } = useCreateOrder()
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)

  if (isLoading) return <p>Loading...</p>

  const holdings = data?.holdings ?? []
  const accounts = accountsData?.accounts ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Portfolio</h1>
      {summary && (
        <div className="flex gap-6 text-sm">
          <span>
            Total Value: <strong>{summary.total_value}</strong>
          </span>
          <span>
            P&amp;L: <strong>{summary.total_profit_loss}</strong>
          </span>
        </div>
      )}
      <HoldingsTable holdings={holdings} onSell={setSelectedHolding} />
      {selectedHolding && (
        <SellOrderDialog
          open={!!selectedHolding}
          onOpenChange={(open) => {
            if (!open) setSelectedHolding(null)
          }}
          holding={selectedHolding}
          accounts={accounts}
          onSubmit={(payload) => {
            createOrder(payload, { onSuccess: () => setSelectedHolding(null) })
          }}
          loading={isPending}
        />
      )}
    </div>
  )
}
