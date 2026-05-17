import type { PortfolioSummary } from '@/types/portfolio'

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary
}

export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Unrealized P&L</p>
        <p className="text-xl font-bold">{summary.unrealized_profit}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Realized (Lifetime)</p>
        <p className="text-xl font-bold">{summary.realized_profit_lifetime_rsd} RSD</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Tax Paid (Year)</p>
        <p className="text-xl font-bold">{summary.tax_paid_this_year} RSD</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Open Positions</p>
        <p className="text-xl font-bold">{summary.open_positions_count}</p>
      </div>
    </div>
  )
}
