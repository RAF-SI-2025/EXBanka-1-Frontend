import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAccounts } from '@/hooks/useAccounts'
import { usePayments } from '@/hooks/usePayments'
import { AccountCard } from '@/components/accounts/AccountCard'
import { RecentTransactions } from '@/components/accounts/RecentTransactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Account } from '@/types/account'
import type { Payment } from '@/types/payment'

export function AccountListPage() {
  const navigate = useNavigate()
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date')

  const effectiveAccount = selectedAccount ?? accounts[0] ?? null

  const { data: paymentsData } = usePayments(
    effectiveAccount ? effectiveAccount.account_number : undefined
  )

  const sortedTransactions = [...(paymentsData?.payments ?? [])].sort((a: Payment, b: Payment) => {
    if (sortBy === 'date') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    return a.status.localeCompare(b.status)
  })

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Moji računi</h1>
      <div className="space-y-3">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onClick={() => setSelectedAccount(account)}
          />
        ))}
        {accounts.length === 0 && <p className="text-muted-foreground">Nemate aktivnih računa.</p>}
      </div>

      {effectiveAccount && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              Poslednje transakcije — {effectiveAccount.account_name}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/accounts/${effectiveAccount.id}`)}
            >
              Detalji računa
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Label>Sortiraj po:</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'type')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Datumu</SelectItem>
                  <SelectItem value="type">Tipu transakcije</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <RecentTransactions transactions={sortedTransactions} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
