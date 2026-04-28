import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useEmployee } from '@/hooks/useEmployee'
import type { Fund } from '@/types/fund'

interface FundDetailsPanelProps {
  fund: Fund
}

export function FundDetailsPanel({ fund }: FundDetailsPanelProps) {
  const { data: managerData } = useEmployee(fund.manager_employee_id)
  const managerName = managerData
    ? `${managerData.first_name} ${managerData.last_name}`
    : `Employee #${fund.manager_employee_id}`

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
      <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Metric label="Manager" value={managerName} />
        <Metric label="Fund value" value={`${fund.fund_value_rsd} RSD`} />
        <Metric label="Profit" value={`${fund.profit_rsd} RSD`} />
        <Metric label="Liquid cash" value={`${fund.liquid_cash_rsd} RSD`} />
        <Metric label="Min. contribution" value={`${fund.minimum_contribution_rsd} RSD`} />
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
