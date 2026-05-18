import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { useBankAccounts, useClientAccounts } from '@/hooks/useAccounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { useFund, useInvestFund } from '@/hooks/useFunds'
import { notifySuccess } from '@/lib/errors'
import { FundDetailsPanel } from '@/views/funds/components/FundDetailsPanel'
import { FundHoldingsTable } from '@/views/funds/components/FundHoldingsTable'
import { FundPerformanceChart } from '@/views/funds/components/FundPerformanceChart'
import { InvestInFundDialog } from '@/views/funds/components/InvestInFundDialog'
import { ViewShell } from '@/views/shared'

export function FundDetailsView() {
  const { id } = useParams<{ id: string }>()
  const fundId = Number(id)
  const { data, isLoading, isError } = useFund(fundId)

  const userType = useAppSelector(selectUserType)
  const isEmployee = userType === 'employee'

  const { data: clientAccountsData } = useClientAccounts(!isEmployee)
  const { data: bankAccountsData } = useBankAccounts(isEmployee)
  const accounts = isEmployee
    ? (bankAccountsData?.accounts ?? [])
    : (clientAccountsData?.accounts ?? [])

  const [investOpen, setInvestOpen] = useState(false)
  const investMutation = useInvestFund(fundId)

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
        <Button onClick={() => setInvestOpen(true)} disabled={!fund.active}>
          Invest
        </Button>
      }
    >
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

      {investOpen && (
        <InvestInFundDialog
          open
          onOpenChange={setInvestOpen}
          fund={fund}
          accounts={accounts}
          asBank={isEmployee}
          onSubmit={(payload) =>
            investMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess(
                  isEmployee
                    ? `Bank invested in ${fund.name}.`
                    : `Investment placed in ${fund.name}.`
                )
                setInvestOpen(false)
              },
            })
          }
          loading={investMutation.isPending}
        />
      )}
    </ViewShell>
  )
}
