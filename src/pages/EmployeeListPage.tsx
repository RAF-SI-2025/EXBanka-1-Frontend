import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmployeeTable } from '@/components/employees/EmployeeTable'

import { EmployeeFilters } from '@/components/employees/EmployeeFilters'
import { useEmployees } from '@/hooks/useEmployees'
import type { EmployeeFilters as Filters } from '@/types/employee'

export function EmployeeListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ page: 1, page_size: 20 })
  const { data, isLoading } = useEmployees(filters)

  const handleFilter = (newFilters: Filters) => {
    setFilters({ ...newFilters, page: 1, page_size: 20 })
  }

  const handleRowClick = (id: number) => {
    navigate(`/employees/${id}`)
  }

  const totalPages = Math.ceil((data?.total_count ?? 0) / (filters.page_size ?? 20))
  const currentPage = filters.page ?? 1

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          to="/employees/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-2.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Employee
        </Link>
      </div>

      <EmployeeFilters onFilter={handleFilter} />

      {isLoading ? (
        <p>Loading...</p>
      ) : data?.employees.length ? (
        <>
          <EmployeeTable employees={data.employees} onRowClick={handleRowClick} />
          <p className="text-sm text-muted-foreground mt-2">Total: {data.total_count}</p>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <p>No employees found.</p>
      )}
    </div>
  )
}
