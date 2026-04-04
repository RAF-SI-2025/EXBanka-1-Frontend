import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmployees } from '@/hooks/useEmployees'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EditEmployeeLimitsDialog } from '@/components/admin/EditEmployeeLimitsDialog'
import { LimitTemplatesDialog } from '@/components/admin/LimitTemplatesDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types/employee'
import type { EmployeeFilters } from '@/types/employee'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const FILTER_FIELDS: FilterFieldDef[] = [{ key: 'search', label: 'Search', type: 'text' }]

export function AdminEmployeeLimitsPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const apiFilters: EmployeeFilters = {
    page,
    page_size: PAGE_SIZE,
    name: (filterValues.search as string) || undefined,
  }

  const { data, isLoading } = useEmployees(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleRowClick = useCallback((employee: Employee) => {
    setEditingEmployee(employee)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employee Limits</h1>
        <Button onClick={() => setTemplatesOpen(true)}>Manage Templates</Button>
      </div>

      <Tabs value="employees">
        <TabsList className="mb-4">
          <TabsTrigger value="employees">Employee Limits</TabsTrigger>
          <TabsTrigger value="clients" onClick={() => navigate('/admin/limits/clients')}>
            Client Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <FilterBar fields={FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />

          {isLoading ? (
            <LoadingSpinner />
          ) : data?.employees.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.employees.map((emp) => (
                    <TableRow
                      key={emp.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(emp)}
                    >
                      <TableCell>
                        {emp.first_name} {emp.last_name}
                      </TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRowClick(emp)
                          }}
                        >
                          Edit Limits
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground mt-2">{data.total_count} employees</p>
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <p>No employees found.</p>
          )}
        </TabsContent>
      </Tabs>

      <EditEmployeeLimitsDialog
        open={editingEmployee !== null}
        employeeId={editingEmployee?.id ?? 0}
        employeeName={
          editingEmployee ? `${editingEmployee.first_name} ${editingEmployee.last_name}` : ''
        }
        onClose={() => setEditingEmployee(null)}
        onSave={() => setEditingEmployee(null)}
      />

      <LimitTemplatesDialog open={templatesOpen} onOpenChange={setTemplatesOpen} />
    </div>
  )
}
