import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { ClientTable } from '@/views/clients/components/ClientTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
import type { FilterFieldDef, FilterValues } from '@/types/filters'
import { LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10

const CLIENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]

export function AdminClientsView() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const { data, isLoading } = useAllClients({
    name: (filterValues.name as string) || undefined,
    email: (filterValues.email as string) || undefined,
    page,
    page_size: PAGE_SIZE,
  })
  const clients = data?.clients ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <ViewShell
      title="Client Management"
      subtitle="Browse, search, and edit registered clients."
      actions={<Button onClick={() => navigate('/admin/clients/new')}>New Client</Button>}
    >
      <FilterBar
        fields={CLIENT_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <ClientTable
          clients={clients}
          onEdit={(clientId) => navigate(`/admin/clients/${clientId}`)}
        />
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </ViewShell>
  )
}
