import { useQuery } from '@tanstack/react-query'
import { getEmployees } from '@/lib/api/employees'
import type { EmployeeFilters } from '@/types/employee'

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => getEmployees(filters),
  })
}
