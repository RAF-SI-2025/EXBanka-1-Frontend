import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClientAccounts } from '@/hooks/useAccounts'
import { usePayments } from '@/hooks/usePayments'
import { AccountCard } from '@/components/accounts/AccountCard'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { QuickPayment } from '@/components/home/QuickPayment'
import { ExchangeCalculator } from '@/components/home/ExchangeCalculator'
import { RecentTransactions } from '@/components/accounts/RecentTransactions'
import { cn } from '@/lib/utils'

export function HomePage() {
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0)
  const selectedAccount = accounts[selectedAccountIndex] ?? null

  const { data: paymentsData } = usePayments(
    selectedAccount ? selectedAccount.account_number : undefined,
    selectedAccount ? { page_size: 5 } : undefined
  )
  const recentTransactions = paymentsData?.payments ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dobrodošli, {user?.email}!</h1>
        <p className="text-muted-foreground">Pregled vaših računa</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Brze akcije</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickPayment />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Menjačnica</CardTitle>
          </CardHeader>
          <CardContent>
            <ExchangeCalculator />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Moji računi</h2>
        {isLoading && <p>Učitavanje...</p>}
        {accounts.map((account, i) => (
          <div
            key={account.id}
            className={cn(
              'cursor-pointer',
              i === selectedAccountIndex && 'ring-2 ring-primary rounded-lg'
            )}
            onClick={() => setSelectedAccountIndex(i)}
          >
            <AccountCard account={account} onClick={() => navigate(`/accounts/${account.id}`)} />
          </div>
        ))}
        {!isLoading && accounts.length === 0 && (
          <p className="text-muted-foreground">Nemate aktivnih računa.</p>
        )}
      </div>

      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Poslednje transakcije</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={recentTransactions} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
