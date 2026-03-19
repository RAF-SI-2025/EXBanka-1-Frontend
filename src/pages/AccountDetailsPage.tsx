import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAccount, useUpdateAccount, useClientAccounts } from '@/hooks/useAccounts'
import { AccountCard } from '@/components/accounts/AccountCard'
import { RenameAccountDialog } from '@/components/accounts/RenameAccountDialog'
import { ChangeLimitsDialog } from '@/components/accounts/ChangeLimitsDialog'
import { BusinessAccountInfo } from '@/components/accounts/BusinessAccountInfo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'

export function AccountDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id)
  const { data: account, isLoading } = useAccount(accountId)
  const updateAccount = useUpdateAccount(accountId)
  const { data: allAccountsData } = useClientAccounts()
  const existingNames = (allAccountsData?.accounts ?? [])
    .filter((a) => a.id !== accountId)
    .map((a) => a.name)
  const [renameOpen, setRenameOpen] = useState(false)
  const [limitsOpen, setLimitsOpen] = useState(false)

  if (isLoading) return <p>Učitavanje...</p>
  if (!account) return <p>Račun nije pronađen.</p>

  const handleRename = (name: string) => {
    updateAccount.mutate({ name }, { onSuccess: () => setRenameOpen(false) })
  }

  const handleLimitsChange = (limits: { daily_limit: number; monthly_limit: number }) => {
    updateAccount.mutate(limits, { onSuccess: () => setLimitsOpen(false) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/accounts')}>
          ← Nazad
        </Button>
        <h1 className="text-2xl font-bold">{account.name}</h1>
      </div>

      <AccountCard account={account} />

      <Card>
        <CardHeader>
          <CardTitle>Detalji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {account.owner_name && <InfoRow label="Vlasnik" value={account.owner_name} />}
          <InfoRow
            label="Tip računa"
            value={account.account_type === 'FOREIGN_CURRENCY' ? 'Devizni' : 'Tekući'}
          />
          <InfoRow
            label="Tip vlasnika"
            value={account.owner_type === 'BUSINESS' ? 'Poslovni' : 'Lični'}
          />
          <InfoRow label="Stanje" value={formatCurrency(account.balance, account.currency)} />
          <InfoRow
            label="Raspoloživo"
            value={formatCurrency(account.available_balance, account.currency)}
          />
          <InfoRow label="Rezervisana sredstva" value={formatCurrency(0, account.currency)} />
          {account.daily_limit !== undefined && (
            <InfoRow
              label="Dnevni limit"
              value={formatCurrency(account.daily_limit, account.currency)}
            />
          )}
          {account.monthly_limit !== undefined && (
            <InfoRow
              label="Mesečni limit"
              value={formatCurrency(account.monthly_limit, account.currency)}
            />
          )}
        </CardContent>
      </Card>

      <BusinessAccountInfo company={account.company} />

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/payments/new')}>
          Novo plaćanje
        </Button>
        <Button variant="outline" onClick={() => setRenameOpen(true)}>
          Preimenuj račun
        </Button>
      </div>

      {account.daily_limit !== undefined && (
        <Button variant="outline" onClick={() => setLimitsOpen(true)}>
          Promeni limite
        </Button>
      )}

      <RenameAccountDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentName={account.name}
        existingNames={existingNames}
        onRename={handleRename}
        loading={updateAccount.isPending}
      />

      <ChangeLimitsDialog
        open={limitsOpen}
        onOpenChange={setLimitsOpen}
        currentDailyLimit={account.daily_limit ?? 0}
        currentMonthlyLimit={account.monthly_limit ?? 0}
        currency={account.currency}
        onSubmit={handleLimitsChange}
        loading={updateAccount.isPending}
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
