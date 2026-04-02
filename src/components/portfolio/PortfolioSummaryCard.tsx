import type { PortfolioSummary } from '@/types/portfolio'

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary
}

export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Value</p>
        <p className="text-xl font-bold">{summary.total_value}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Cost</p>
        <p className="text-xl font-bold">{summary.total_cost}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Profit/Loss</p>
        <p
          className={`text-xl font-bold ${
            Number(summary.total_profit_loss) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {summary.total_profit_loss}
        </p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Holdings</p>
        <p className="text-xl font-bold">{summary.holdings_count}</p>
      </div>
    </div>
  )
}
