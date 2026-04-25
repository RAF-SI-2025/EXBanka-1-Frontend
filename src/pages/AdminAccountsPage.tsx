import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllAccounts } from '@/hooks/useAccounts'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { AccountTable } from '@/components/admin/AccountTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { filterAccountsByOwner } from '@/lib/utils/accountFilters'
import type { Client } from '@/types/client'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const ACCOUNT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'owner_name', label: 'Owner Name', type: 'text' },
  { key: 'account_number', label: 'Account Number', type: 'text' },
]

export function AdminAccountsPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const { data, isLoading } = useAllAccounts({
    account_number_filter: (filterValues.account_number as string) || undefined,
    page,
    page_size: PAGE_SIZE,
  })
  const { data: clientsData } = useAllClients()
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  const clientsById = useMemo(
    () =>
      (clientsData?.clients ?? []).reduce<Record<number, Client>>(
        (acc, client) => ({ ...acc, [client.id]: client }),
        {}
      ),
    [clientsData]
  )
  const accounts = useMemo(
    () =>
      filterAccountsByOwner(
        data?.accounts ?? [],
        clientsById,
        (filterValues.owner_name as string) ?? ''
      ),
    [data, clientsById, filterValues.owner_name]
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Account Management</h1>
        <Button onClick={() => navigate('/accounts/new')}>New Account</Button>
      </div>
      <FilterBar
        fields={ACCOUNT_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <AccountTable
          accounts={accounts}
          onViewCards={(id) => navigate(`/admin/accounts/${id}/cards`)}
          onViewActivity={(id) => navigate(`/accounts/${id}/activity`)}
          clientsById={clientsById}
        />
      )}
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
