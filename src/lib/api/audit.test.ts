import { apiClient } from '@/lib/api/axios'
import { getAuditChangelog } from '@/lib/api/audit'
import { createMockAuditEntry } from '@/__tests__/fixtures/audit-fixtures'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
beforeEach(() => jest.clearAllMocks())

describe('getAuditChangelog', () => {
  const cases: Array<[Parameters<typeof getAuditChangelog>[0], string]> = [
    ['clients', '/admin/audit/clients-changelog'],
    ['employees', '/admin/audit/employees-changelog'],
    ['accounts', '/admin/audit/accounts-changelog'],
    ['cards', '/admin/audit/cards-changelog'],
    ['loans', '/admin/audit/loans-changelog'],
  ]

  it.each(cases)('maps %s to %s with filters as query params', async (category, path) => {
    mockGet.mockResolvedValue({
      data: { entries: [createMockAuditEntry()], total: 1, page: 1, page_size: 50 },
    })
    await getAuditChangelog(category, { page: 2, page_size: 10, actor_id: 7 })
    expect(mockGet).toHaveBeenCalledWith(path, {
      params: { page: 2, page_size: 10, actor_id: 7 },
    })
  })

  it('defaults entries[] to [] when backend returns null', async () => {
    mockGet.mockResolvedValue({
      data: { entries: null, total: 0, page: 1, page_size: 50 },
    })
    const result = await getAuditChangelog('clients')
    expect(result.entries).toEqual([])
  })
})
