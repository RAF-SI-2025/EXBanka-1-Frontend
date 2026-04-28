import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

  const { data: paymentsData } = usePayments({ page_size: 5 })
  const recentTransactions = paymentsData?.payments ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.email}!</h1>
        <p className="text-muted-foreground">Your Accounts Overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickPayment />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Currency Exchange</CardTitle>
          </CardHeader>
          <CardContent>
            <ExchangeCalculator />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">My Accounts</h2>
        {isLoading && (
          <div className="space-y-3" data-testid="home-accounts-skeleton">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}
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
          <p className="text-muted-foreground">You have no active accounts.</p>
        )}
      </div>

      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={recentTransactions} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
