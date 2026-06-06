import type { AuditChangelogEntry } from '@/types/audit'

export function createMockAuditEntry(
  overrides: Partial<AuditChangelogEntry> = {}
): AuditChangelogEntry {
  return {
    id: 123,
    entity_type: 'client',
    entity_id: 42,
    action: 'updated',
    field_name: 'first_name',
    old_value: 'Marko',
    new_value: 'Marija',
    actor_id: 7,
    timestamp: '2026-05-28T10:00:00Z',
    reason: '',
    ...overrides,
  }
}
