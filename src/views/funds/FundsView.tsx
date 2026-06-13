import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useFunds, useInvestFund } from '@/hooks/useFunds'
import { useBankAccounts, useClientAccounts } from '@/hooks/useAccounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectHasPermission, selectUserType } from '@/store/selectors/authSelectors'
import { notifySuccess } from '@/lib/errors'
import type { Fund } from '@/types/fund'
import { FundsTable } from '@/views/funds/components/FundsTable'
import { InvestInFundDialog } from '@/views/funds/components/InvestInFundDialog'
import { ViewShell } from '@/views/shared'

export function FundsView() {
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)

  const { data, isLoading } = useFunds({
    search: search || undefined,
    active_only: activeOnly || undefined,
  })
  const funds = data?.funds ?? []

  const userType = useAppSelector(selectUserType)
  const isEmployee = userType === 'employee'
  const canManageFunds = useAppSelector((state) => selectHasPermission(state, 'funds.manage'))

  const { data: clientAccountsData } = useClientAccounts(!isEmployee)
  const { data: bankAccountsData } = useBankAccounts(isEmployee)
  const accounts = isEmployee
    ? (bankAccountsData?.accounts ?? [])
    : (clientAccountsData?.accounts ?? [])

  const investMutation = useInvestFund(selectedFund?.id ?? 0)

  return (
    <ViewShell
      title="Funds"
      subtitle="Browse and invest in actively managed funds."
      actions={
        canManageFunds && (
          <Link to="/funds/new" className={cn(buttonVariants())}>
            Create fund
          </Link>
        )
      }
    >
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-48">
              <Label htmlFor="funds-search">Search</Label>
              <Input
                id="funds-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Fund name"
              />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox
                id="funds-active-only"
                checked={activeOnly}
                onCheckedChange={(v) => setActiveOnly(Boolean(v))}
              />
              <Label htmlFor="funds-active-only">Active only</Label>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <FundsTable funds={funds} onInvest={setSelectedFund} />
          )}
        </CardContent>
      </Card>

      {selectedFund && (
        <InvestInFundDialog
          open
          onOpenChange={(open) => !open && setSelectedFund(null)}
          fund={selectedFund}
          accounts={accounts}
          asBank={isEmployee}
          onSubmit={(payload) =>
            investMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess(
                  isEmployee
                    ? `Bank invested in ${selectedFund.name}.`
                    : `Investment placed in ${selectedFund.name}.`
                )
                setSelectedFund(null)
              },
            })
          }
          loading={investMutation.isPending}
        />
      )}
    </ViewShell>
  )
}
