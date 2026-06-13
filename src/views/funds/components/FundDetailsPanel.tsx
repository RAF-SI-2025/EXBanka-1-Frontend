import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useEmployee } from '@/hooks/useEmployee'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectHasPermission } from '@/store/selectors/authSelectors'
import type { FundDetailResponse } from '@/types/fund'
import { formatRsd } from '@/views/funds/components/fundFormat'

interface FundDetailsPanelProps {
  detail: FundDetailResponse
}

export function FundDetailsPanel({ detail }: FundDetailsPanelProps) {
  const { fund, liquid_rsd_balance, total_holdings_value_rsd, total_dividends_paid_rsd } = detail

  const canReadEmployees = useAppSelector((s) => selectHasPermission(s, 'employees.read'))
  const { data: managerData } = useEmployee(fund.manager_employee_id, {
    suppressGlobalError: true,
    enabled: canReadEmployees,
  })
  const managerName = managerData
    ? `${managerData.first_name} ${managerData.last_name}`
    : `Employee #${fund.manager_employee_id}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Metric label="Holdings value" value={formatRsd(total_holdings_value_rsd)} />
        <Metric label="Liquid cash" value={formatRsd(liquid_rsd_balance)} />
        <Metric label="Dividends paid" value={formatRsd(total_dividends_paid_rsd)} />
        <Metric label="Min. contribution" value={formatRsd(fund.minimum_contribution_rsd)} />
        <Metric label="Manager" value={managerName} />
        <Metric label="Account #" value={String(fund.rsd_account_id)} />
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
