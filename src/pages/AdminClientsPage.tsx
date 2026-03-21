import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { ClientTable } from '@/components/admin/ClientTable'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const CLIENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'name', label: 'Ime', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]

export function AdminClientsPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const { data, isLoading } = useAllClients({
    name: (filterValues.name as string) || undefined,
    email: (filterValues.email as string) || undefined,
  })
  const clients = data?.clients ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upravljanje klijentima</h1>
        <Button onClick={() => navigate('/admin/clients/new')}>Novi klijent</Button>
      </div>

      <FilterBar fields={CLIENT_FILTER_FIELDS} values={filterValues} onChange={setFilterValues} />

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <ClientTable
          clients={clients}
          onEdit={(clientId) => navigate(`/admin/clients/${clientId}`)}
        />
      )}
    </div>
  )
}
