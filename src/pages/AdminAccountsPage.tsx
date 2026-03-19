import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllAccounts } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/button'
import { AccountFilters } from '@/components/admin/AccountFilters'
import { AccountTable } from '@/components/admin/AccountTable'

export function AdminAccountsPage() {
  const navigate = useNavigate()
  const [ownerName, setOwnerName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const { data, isLoading } = useAllAccounts({
    name_filter: ownerName || undefined,
    account_number_filter: accountNumber || undefined,
  })
  const accounts = data?.accounts ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upravljanje računima</h1>
        <Button onClick={() => navigate('/accounts/new')}>Novi račun</Button>
      </div>
      <AccountFilters
        ownerName={ownerName}
        onOwnerNameChange={setOwnerName}
        accountNumber={accountNumber}
        onAccountNumberChange={setAccountNumber}
      />
      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <AccountTable
          accounts={accounts}
          onViewCards={(id) => navigate(`/admin/accounts/${id}/cards`)}
        />
      )}
    </div>
  )
}
