import type { Actuary } from '@/types/actuary'

export function createMockActuary(overrides: Partial<Actuary> = {}): Actuary {
  return {
    id: 1,
    employee_id: 1,
    first_name: 'Agent',
    last_name: 'Smith',
    email: 'agent.smith@example.com',
    phone: '+38161000000',
    position: 'Agent',
    department: 'Trading',
    active: true,
    limit: '100000.00',
    used_limit: '15000.00',
    need_approval: true,
    ...overrides,
  }
}
