import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { EmployeeProfileTab } from '@/components/employees/EmployeeProfileTab'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useEmployees } from '@/hooks/useEmployees'
import type { EmployeeFilters as EmployeeFiltersType } from '@/types/employee'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const EMPLOYEE_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'position', label: 'Position', type: 'text' },
]

export function EmployeeListPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const apiFilters: EmployeeFiltersType = {
    page,
    page_size: PAGE_SIZE,
    name: (filterValues.name as string) || undefined,
    email: (filterValues.email as string) || undefined,
    position: (filterValues.position as string) || undefined,
  }

  const { data, isLoading } = useEmployees(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleRowClick = useCallback((id: number) => navigate(`/employees/${id}`), [navigate])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          to="/employees/new"
          className="inline-flex items-center justify-center rounded-lg bg-accent-2 px-2.5 py-1.5 text-sm font-medium text-accent-2-foreground transition-colors hover:bg-accent-2/90"
        >
          Create Employee
        </Link>
      </div>

      <Tabs defaultValue="employees">
        <TabsList className="mb-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="me">Me</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <FilterBar
            fields={EMPLOYEE_FILTER_FIELDS}
            values={filterValues}
            onChange={handleFilterChange}
          />

          {isLoading ? (
            <LoadingSpinner />
          ) : data?.employees.length ? (
            <>
              <EmployeeTable employees={data.employees} onRowClick={handleRowClick} />
              <p className="text-sm text-muted-foreground mt-2">{data.total_count} employees</p>
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <p>No employees found.</p>
          )}
        </TabsContent>

        <TabsContent value="me">
          <EmployeeProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
