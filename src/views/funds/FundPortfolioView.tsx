import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { useFund, useFunds } from '@/hooks/useFunds'
import { FundPerformanceChart } from '@/views/funds/components/FundPerformanceChart'
import { FundPortfolioHoldingsTable } from '@/views/funds/components/FundPortfolioHoldingsTable'
import { ViewShell } from '@/views/shared'

function formatRsd(value: string | null | undefined): string {
  if (value === null || value === undefined) return '— RSD'
  const num = Number(value)
  if (Number.isNaN(num)) return `${value} RSD`
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 2,
  }).format(num)
}

// Backend's detail endpoint omits the computed financial fields, while the
// list endpoint includes them. Prefer the list value, fall back to detail.
function pickMetric(
  listValue: string | null | undefined,
  detailValue: string | null | undefined
): string | null | undefined {
  return listValue ?? detailValue
}

export function FundPortfolioView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fundId = Number(id)
  const { data, isLoading, isError } = useFund(fundId)
  // Detail endpoint omits computed financial values; pull them from the list.
  const { data: fundsListData } = useFunds({ page_size: 500 })
  const listFund = fundsListData?.funds.find((f) => f.id === fundId)

  if (isLoading) {
    return (
      <ViewShell>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </ViewShell>
    )
  }
  if (isError || !data) {
    return (
      <ViewShell title="Fund">
        <ErrorFallback message="Could not load fund." />
      </ViewShell>
    )
  }

  const { fund, holdings, performance } = data

  return (
    <ViewShell
      title={fund.name}
      subtitle={fund.description}
      actions={
        <Button variant="outline" onClick={() => navigate('/funds')}>
          ← Back to Funds
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Fund value</p>
          <p className="text-xl font-bold">
            {formatRsd(pickMetric(listFund?.fund_value_rsd, fund.fund_value_rsd))}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Liquid cash</p>
          <p className="text-xl font-bold">
            {formatRsd(pickMetric(listFund?.liquid_cash_rsd, fund.liquid_cash_rsd))}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Profit</p>
          <p className="text-xl font-bold">
            {formatRsd(pickMetric(listFund?.profit_rsd, fund.profit_rsd))}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Holdings</p>
          <p className="text-xl font-bold">{holdings.length}</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <FundPerformanceChart performance={performance} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <FundPortfolioHoldingsTable holdings={holdings} />
        </CardContent>
      </Card>
    </ViewShell>
  )
}
