import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/hooks/useEmployee'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectHasPermission } from '@/store/selectors/authSelectors'
import type { FundDetailResponse } from '@/types/fund'

interface FundDetailsPanelProps {
  detail: FundDetailResponse
}

export function FundDetailsPanel({ detail }: FundDetailsPanelProps) {
  const {
    fund,
    investor_count,
    liquid_rsd_balance,
    total_contributed_rsd,
    total_holdings_value_rsd,
    total_value_rsd,
    total_dividends_paid_rsd,
    profit_rsd,
    profit_pct,
  } = detail

  const canReadEmployees = useAppSelector((s) => selectHasPermission(s, 'employees.read'))
  const { data: managerData } = useEmployee(fund.manager_employee_id, {
    suppressGlobalError: true,
    enabled: canReadEmployees,
  })
  const managerName = managerData
    ? `${managerData.first_name} ${managerData.last_name}`
    : `Employee #${fund.manager_employee_id}`

  const profitNum = Number(profit_rsd)
  const profitPositive = Number.isFinite(profitNum) && profitNum >= 0
  const profitClass = !Number.isFinite(profitNum)
    ? ''
    : profitPositive
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {fund.name}
          {!fund.active && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Inactive
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{fund.description}</p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <Metric label="Total value" value={formatRsd(total_value_rsd)} />
        <Metric
          label="Profit"
          value={`${formatRsd(profit_rsd)} (${formatPct(profit_pct)})`}
          valueClassName={profitClass}
        />
        <Metric label="Total contributed" value={formatRsd(total_contributed_rsd)} />
        <Metric label="Holdings value" value={formatRsd(total_holdings_value_rsd)} />
        <Metric label="Liquid cash" value={formatRsd(liquid_rsd_balance)} />
        <Metric label="Dividends paid" value={formatRsd(total_dividends_paid_rsd)} />
        <Metric label="Investors" value={String(investor_count)} />
        <Metric label="Min. contribution" value={formatRsd(fund.minimum_contribution_rsd)} />
        <Metric label="Manager" value={managerName} />
        <Metric label="Account #" value={String(fund.rsd_account_id)} />
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('font-medium', valueClassName)}>{value}</p>
    </div>
  )
}

function formatRsd(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '— RSD'
  const num = Number(value)
  if (!Number.isFinite(num)) return `${value} RSD`
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 2,
  }).format(num)
}

function formatPct(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—%'
  const num = Number(value)
  if (!Number.isFinite(num)) return `${value}%`
  return `${num.toFixed(2)}%`
}
