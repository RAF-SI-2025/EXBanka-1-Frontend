import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  useClientAccount,
  useUpdateAccountName,
  useUpdateAccountLimits,
  useClientAccounts,
} from '@/hooks/useAccounts'
import { AccountCard } from '@/components/accounts/AccountCard'
import { RenameAccountDialog } from '@/components/accounts/RenameAccountDialog'
import { ChangeLimitsDialog } from '@/components/accounts/ChangeLimitsDialog'
import { BusinessAccountInfo } from '@/components/accounts/BusinessAccountInfo'
import { LimitsUsageCard } from '@/components/accounts/LimitsUsageCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'

export function AccountDetailsPage() {
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

  if (isLoading) return <p>Loading...</p>
  if (!account) return <p>Account not found.</p>

  const handleRename = (name: string) => {
    updateAccountName.mutate({ new_name: name }, { onSuccess: () => setRenameOpen(false) })
  }

  const handleLimitsChange = (limits: { daily_limit: number; monthly_limit: number }) => {
    updateAccountLimits.mutate(limits, { onSuccess: () => setLimitsOpen(false) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/accounts')}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">{account.account_name}</h1>
      </div>

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
          <InfoRow label="Reserved Funds" value={formatCurrency(0, account.currency_code)} />
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

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/payments/new')}>
          New Payment
        </Button>
        <Button variant="outline" onClick={() => setRenameOpen(true)}>
          Rename Account
        </Button>
      </div>

      {account.daily_limit !== undefined && (
        <Button variant="outline" onClick={() => setLimitsOpen(true)}>
          Change Limits
        </Button>
      )}

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
    </div>
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
