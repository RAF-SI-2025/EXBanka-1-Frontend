import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  useClientAccount,
  useUpdateAccountName,
  useUpdateAccountLimits,
  useClientAccounts,
} from '@/hooks/useAccounts'
import { AccountCard } from '@/views/accounts/components/AccountCard'
import { RenameAccountDialog } from '@/views/accounts/components/RenameAccountDialog'
import { ChangeLimitsDialog } from '@/views/accounts/components/ChangeLimitsDialog'
import { BusinessAccountInfo } from '@/views/accounts/components/BusinessAccountInfo'
import { LimitsUsageCard } from '@/views/accounts/components/LimitsUsageCard'
import { AccountActivityPanel } from '@/views/accounts/components/AccountActivityPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function AccountDetailsView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id)
  const { data: account, isLoading } = useClientAccount(accountId)
  const updateAccountName = useUpdateAccountName(accountId)
  const updateAccountLimits = useUpdateAccountLimits(accountId)
  const { data: allAccountsData } = useClientAccounts()
  const existingNames = (allAccountsData?.accounts ?? [])
    .filter((a) => a.id !== accountId)
    .map((a) => a.account_name)
  const [renameOpen, setRenameOpen] = useState(false)
  const [limitsOpen, setLimitsOpen] = useState(false)

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (!account) {
    return (
      <ViewShell title="Account">
        <EmptyState title="Account not found." />
      </ViewShell>
    )
  }

  const handleRename = (name: string) => {
    updateAccountName.mutate({ new_name: name }, { onSuccess: () => setRenameOpen(false) })
  }

  const handleLimitsChange = (limits: { daily_limit: number; monthly_limit: number }) => {
    updateAccountLimits.mutate(limits, { onSuccess: () => setLimitsOpen(false) })
  }

  return (
    <ViewShell
      title={
        <span className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/accounts')}>
            ← Back
          </Button>
          {account.account_name}
        </span>
      }
    >
      <AccountCard account={account} />

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {account.owner_name && <InfoRow label="Owner" value={account.owner_name} />}
          <InfoRow
            label="Account Type"
            value={account.account_kind === 'foreign' ? 'Foreign Currency' : 'Checking'}
          />
          <InfoRow
            label="Owner Type"
            value={account.account_category === 'business' ? 'Business' : 'Personal'}
          />
          <InfoRow label="Balance" value={formatCurrency(account.balance, account.currency_code)} />
          <InfoRow
            label="Available"
            value={formatCurrency(account.available_balance, account.currency_code)}
          />
          <InfoRow
            label="Reserved Funds"
            value={formatCurrency(account.reserved_balance, account.currency_code)}
          />
        </CardContent>
      </Card>

      <LimitsUsageCard
        dailyLimit={account.daily_limit}
        monthlyLimit={account.monthly_limit}
        dailySpending={account.daily_spending}
        monthlySpending={account.monthly_spending}
        currency={account.currency_code}
      />

      <BusinessAccountInfo company={account.company} />

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate('/payments/new')}>
          New Payment
        </Button>
        <Button variant="outline" onClick={() => setRenameOpen(true)}>
          Rename Account
        </Button>
        {account.daily_limit !== undefined && (
          <Button variant="outline" onClick={() => setLimitsOpen(true)}>
            Change Limits
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountActivityPanel accountId={account.id} />
        </CardContent>
      </Card>

      <RenameAccountDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentName={account.account_name}
        existingNames={existingNames}
        onRename={handleRename}
        loading={updateAccountName.isPending}
      />

      <ChangeLimitsDialog
        open={limitsOpen}
        onOpenChange={setLimitsOpen}
        currentDailyLimit={account.daily_limit ?? 0}
        currentMonthlyLimit={account.monthly_limit ?? 0}
        currency={account.currency_code}
        onSubmit={handleLimitsChange}
        loading={updateAccountLimits.isPending}
      />
    </ViewShell>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
