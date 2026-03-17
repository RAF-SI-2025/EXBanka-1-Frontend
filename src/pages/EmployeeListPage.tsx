import { useState, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'
import { EmployeeProfileTab } from '@/components/employees/EmployeeProfileTab'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useEmployees } from '@/hooks/useEmployees'
import { usePagination } from '@/hooks/usePagination'
import type { FilterCategory } from '@/types/employee'

const PAGE_SIZE = 20

export function EmployeeListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useEmployees()
  const [filter, setFilter] = useState<{
    category: FilterCategory
    value: string
  } | null>(null)

  const filteredEmployees = useMemo(() => {
    const employees = data?.employees ?? []
    if (!filter || !filter.value.trim()) return employees
    const val = filter.value.toLowerCase().trim()
    return employees.filter((emp) => {
      if (filter.category === 'all') {
        return (['first_name', 'last_name', 'email', 'position'] as const).some(
          (field) => emp[field]?.toLowerCase().includes(val) ?? false
        )
      }
      const field = emp[filter.category]
      return field?.toLowerCase().includes(val) ?? false
    })
  }, [data?.employees, filter])

  const {
    page,
    setPage,
    totalPages,
    paginatedItems: paginatedEmployees,
  } = usePagination(filteredEmployees, PAGE_SIZE)

  const handleFilterChange = (newFilter: { category: FilterCategory; value: string } | null) => {
    setFilter(newFilter)
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
          <EmployeeFilters onFilterChange={handleFilterChange} />

          {isLoading ? (
            <LoadingSpinner />
          ) : paginatedEmployees.length ? (
            <>
              <EmployeeTable employees={paginatedEmployees} onRowClick={handleRowClick} />
              <p className="text-sm text-muted-foreground mt-2">
                {filteredEmployees.length} of {data?.employees.length ?? 0} employees
              </p>
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
