export type AuditCategory = 'clients' | 'employees' | 'accounts' | 'cards' | 'loans'

export interface AuditChangelogEntry {
  id: number
  entity_type: string
  entity_id: number
  action: string
  field_name: string
  old_value: string
  new_value: string
  actor_id: number
  timestamp: string
  reason: string
}

export interface AuditLogResponse {
  entries: AuditChangelogEntry[]
  total: number
  page: number
  page_size: number
}

export interface AuditLogFilters {
  page?: number
  page_size?: number
  since?: string
  until?: string
  actor_id?: number
  action?: string
}
