import { apiClient } from '@/lib/api/axios'
import type { AuditCategory, AuditLogFilters, AuditLogResponse } from '@/types/audit'

const CATEGORY_PATH: Record<AuditCategory, string> = {
  clients: '/admin/audit/clients-changelog',
  employees: '/admin/audit/employees-changelog',
  accounts: '/admin/audit/accounts-changelog',
  cards: '/admin/audit/cards-changelog',
  loans: '/admin/audit/loans-changelog',
}

export async function getAuditChangelog(
  category: AuditCategory,
  filters: AuditLogFilters = {}
): Promise<AuditLogResponse> {
  const { data } = await apiClient.get<AuditLogResponse>(CATEGORY_PATH[category], {
    params: filters,
  })
  return { ...data, entries: data.entries ?? [] }
}
