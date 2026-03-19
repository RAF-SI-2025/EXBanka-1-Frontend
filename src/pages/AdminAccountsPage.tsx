import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllAccounts } from '@/hooks/useAccounts'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { AccountFilters } from '@/components/admin/AccountFilters'
import { AccountTable } from '@/components/admin/AccountTable'
import { filterAccountsByOwner } from '@/lib/utils/accountFilters'
import type { Client } from '@/types/client'

export function AdminAccountsPage() {
  const navigate = useNavigate()
  const [ownerName, setOwnerName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const { data, isLoading } = useAllAccounts({
    account_number_filter: accountNumber || undefined,
  })
  const { data: clientsData } = useAllClients()
  const clientsById = useMemo(
    () =>
      (clientsData?.clients ?? []).reduce<Record<number, Client>>(
        (acc, client) => ({ ...acc, [client.id]: client }),
        {}
      ),
    [clientsData]
  )
  const accounts = useMemo(
    () => filterAccountsByOwner(data?.accounts ?? [], clientsById, ownerName),
    [data, clientsById, ownerName]
  )

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
          clientsById={clientsById}
        />
      )}
    </div>
  )
}
