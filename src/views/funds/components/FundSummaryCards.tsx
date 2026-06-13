import { cn } from '@/lib/utils'
import type { FundDetailResponse } from '@/types/fund'
import { formatPct, formatRsd, signClass } from '@/views/funds/components/fundFormat'

interface FundSummaryCardsProps {
  detail: FundDetailResponse
}

export function FundSummaryCards({ detail }: FundSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Stat label="Total value" value={formatRsd(detail.total_value_rsd)} />
      <Stat
        label="Profit"
        value={`${formatRsd(detail.profit_rsd)} (${formatPct(detail.profit_pct)})`}
        valueClassName={signClass(detail.profit_rsd)}
        testId="fund-summary-profit"
      />
      <Stat label="Total contributed" value={formatRsd(detail.total_contributed_rsd)} />
      <Stat label="Investors" value={String(detail.investor_count)} />
    </div>
  )
}

function Stat({
  label,
  value,
  valueClassName,
  testId,
}: {
  label: string
  value: string
  valueClassName?: string
  testId?: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-bold', valueClassName)} data-testid={testId}>
        {value}
      </p>
    </div>
  )
}
