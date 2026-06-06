import { useQuery } from '@tanstack/react-query'
import { getAuditChangelog } from '@/lib/api/audit'
import type { AuditCategory, AuditLogFilters } from '@/types/audit'

export function useAuditLogs(category: AuditCategory, filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['audit-logs', category, filters],
    queryFn: () => getAuditChangelog(category, filters),
  })
}
