import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useFunds, useInvestFund } from '@/hooks/useFunds'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectHasPermission, selectUserType } from '@/store/selectors/authSelectors'
import { FundsTable } from '@/components/funds/FundsTable'
import { InvestInFundDialog } from '@/components/funds/InvestInFundDialog'
import { notifySuccess } from '@/lib/errors'
import type { Fund } from '@/types/fund'

export function FundsDiscoveryPage() {
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

  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const investMutation = useInvestFund(selectedFund?.id ?? 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Funds</h1>
        {canManageFunds && (
          <Button asChild>
            <Link to="/funds/new">Create fund</Link>
          </Button>
        )}
      </div>

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

      {selectedFund && !isEmployee && (
        <InvestInFundDialog
          open
          onOpenChange={(open) => !open && setSelectedFund(null)}
          fund={selectedFund}
          accounts={accounts}
          onSubmit={(payload) =>
            investMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess(`Investment placed in ${selectedFund.name}.`)
                setSelectedFund(null)
              },
            })
          }
          loading={investMutation.isPending}
        />
      )}
    </div>
  )
}
