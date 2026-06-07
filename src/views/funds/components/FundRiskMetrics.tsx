import { cn } from '@/lib/utils'
import type { Fund } from '@/types/fund'
import { formatPct, signClass } from '@/views/funds/components/fundFormat'

interface FundRiskMetricsProps {
  fund: Fund
}

function formatRatio(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (!Number.isFinite(num)) return `${value}`
  return num.toFixed(2)
}

export function FundRiskMetrics({ fund }: FundRiskMetricsProps) {
  if (fund.metrics_available === false) {
    return (
      <p className="text-sm text-muted-foreground mb-6" data-testid="fund-risk-unavailable">
        Risk &amp; return metrics aren&apos;t available yet — they appear once the fund has enough
        daily NAV history.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Stat
        label="Annualized return"
        value={formatPct(fund.annualized_return_pct)}
        valueClassName={signClass(fund.annualized_return_pct)}
      />
      <Stat label="Volatility" value={formatPct(fund.volatility_pct)} />
      <Stat label="Sharpe (reward/variability)" value={formatRatio(fund.reward_to_variability)} />
      <Stat
        label="Max drawdown"
        value={formatPct(fund.max_drawdown_pct)}
        valueClassName={signClass(fund.max_drawdown_pct)}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-semibold', valueClassName)}>{value}</p>
    </div>
  )
}
