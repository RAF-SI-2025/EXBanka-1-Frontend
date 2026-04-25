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
import type { Payment } from '@/types/payment'

export function AccountListPage() {
  const navigate = useNavigate()
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date')

  const effectiveAccount = accounts[0] ?? null

  const { data: paymentsData } = usePayments({ page_size: 5 })

  const sortedTransactions = [...(paymentsData?.payments ?? [])].sort((a: Payment, b: Payment) => {
    if (sortBy === 'date') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    return a.status.localeCompare(b.status)
  })

  if (isLoading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Accounts</h1>
      <div className="space-y-3">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onClick={() => navigate(`/accounts/${account.id}`)}
          />
        ))}
        {accounts.length === 0 && (
          <p className="text-muted-foreground">You have no active accounts.</p>
        )}
      </div>

      {effectiveAccount && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              Recent Transactions — {effectiveAccount.account_name}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/accounts/${effectiveAccount.id}`)}
            >
              Account Details
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Label>Sort by:</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'type')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="type">Transaction Type</SelectItem>
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
