import { useQuery } from '@tanstack/react-query'
import { getEmployees } from '@/lib/api/employees'

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees({}),
  })
}
