import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAllClients } from '@/hooks/useClients'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EditClientLimitsDialog } from '@/components/admin/EditClientLimitsDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Client } from '@/types/client'
import type { ClientFilters } from '@/types/client'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function AdminClientLimitsPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const apiFilters: ClientFilters = {
    page,
    page_size: PAGE_SIZE,
    name: (filterValues.search as string) || undefined,
  }

  const { data, isLoading } = useAllClients(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleRowClick = useCallback((client: Client) => {
    setEditingClient(client)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Client Limits</h1>

      <Tabs value="clients">
        <TabsList className="mb-4">
          <TabsTrigger value="employees" onClick={() => navigate('/admin/limits/employees')}>
            Employee Limits
          </TabsTrigger>
          <TabsTrigger value="clients">Client Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <FilterBar fields={FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />

          {isLoading ? (
            <LoadingSpinner />
          ) : data?.clients.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.clients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(client)}
                    >
                      <TableCell>
                        {client.first_name} {client.last_name}
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            handleRowClick(client)
                          }}
                        >
                          Edit Limits
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground mt-2">{data.total} clients</p>
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <p>No clients found.</p>
          )}
        </TabsContent>
      </Tabs>

      <EditClientLimitsDialog
        open={editingClient !== null}
        clientId={editingClient?.id ?? 0}
        clientName={editingClient ? `${editingClient.first_name} ${editingClient.last_name}` : ''}
        onClose={() => setEditingClient(null)}
        onSave={() => setEditingClient(null)}
      />
    </div>
  )
}
