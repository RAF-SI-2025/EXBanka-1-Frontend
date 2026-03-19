import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAccounts } from '@/hooks/useAccounts'
import { usePayments } from '@/hooks/usePayments'
import { AccountCard } from '@/components/accounts/AccountCard'
import { RecentTransactions } from '@/components/accounts/RecentTransactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Account } from '@/types/account'

export function AccountListPage() {
  const navigate = useNavigate()
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const { data: paymentsData } = usePayments(
    selectedAccount ? { account_number: selectedAccount.account_number } : undefined
  )
  const transactions = paymentsData?.payments ?? []

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

      {selectedAccount && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              Poslednje transakcije — {selectedAccount.name}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/accounts/${selectedAccount.id}`)}
            >
              Detalji računa
            </Button>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={transactions} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
