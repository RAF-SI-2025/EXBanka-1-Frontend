import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { useFund } from '@/hooks/useFunds'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { FundPortfolioHoldingsTable } from '@/views/funds/components/FundPortfolioHoldingsTable'
import { SellFundHoldingDialog } from '@/views/funds/components/SellFundHoldingDialog'
import { ViewShell } from '@/views/shared'
import type { FundHolding } from '@/types/fund'

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

export function FundPortfolioView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fundId = Number(id)
  const { data, isLoading, isError } = useFund(fundId)
  const isEmployee = useAppSelector(selectUserType) === 'employee'
  const [sellTarget, setSellTarget] = useState<FundHolding | null>(null)

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

  const { fund, holdings, total_value_rsd, liquid_rsd_balance, profit_rsd } = data
  const holdingsCount = holdings?.length ?? 0

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
          <p className="text-xl font-bold">{formatRsd(total_value_rsd)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Liquid cash</p>
          <p className="text-xl font-bold">{formatRsd(liquid_rsd_balance)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Profit</p>
          <p className="text-xl font-bold">{formatRsd(profit_rsd)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Holdings</p>
          <p className="text-xl font-bold">{holdingsCount}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <FundPortfolioHoldingsTable
            holdings={holdings}
            onSell={isEmployee ? setSellTarget : undefined}
          />
        </CardContent>
      </Card>

      {sellTarget && (
        <SellFundHoldingDialog
          open
          onOpenChange={(o) => !o && setSellTarget(null)}
          holding={sellTarget}
          fundId={fundId}
          fundName={fund.name}
        />
      )}
    </ViewShell>
  )
}
