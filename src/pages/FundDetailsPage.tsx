import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFund, useInvestFund } from '@/hooks/useFunds'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { FundDetailsPanel } from '@/components/funds/FundDetailsPanel'
import { FundHoldingsTable } from '@/components/funds/FundHoldingsTable'
import { FundPerformanceChart } from '@/components/funds/FundPerformanceChart'
import { InvestInFundDialog } from '@/components/funds/InvestInFundDialog'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { notifySuccess } from '@/lib/errors'

export function FundDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const fundId = Number(id)
  const { data, isLoading, isError } = useFund(fundId)

  const userType = useAppSelector(selectUserType)
  const isEmployee = userType === 'employee'

  const { data: clientAccountsData } = useClientAccounts()
  const accounts = clientAccountsData?.accounts ?? []

  const [investOpen, setInvestOpen] = useState(false)
  const investMutation = useInvestFund(fundId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }
  if (isError || !data) {
    return <ErrorFallback message="Could not load fund." />
  }

  const { fund, holdings, performance } = data

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setInvestOpen(true)} disabled={!fund.active}>
          Invest
        </Button>
      </div>

      <FundDetailsPanel fund={fund} />

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <FundHoldingsTable holdings={holdings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <FundPerformanceChart performance={performance} />
        </CardContent>
      </Card>

      {investOpen && !isEmployee && (
        <InvestInFundDialog
          open
          onOpenChange={setInvestOpen}
          fund={fund}
          accounts={accounts}
          onSubmit={(payload) =>
            investMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess(`Investment placed in ${fund.name}.`)
                setInvestOpen(false)
              },
            })
          }
          loading={investMutation.isPending}
        />
      )}
    </div>
  )
}
