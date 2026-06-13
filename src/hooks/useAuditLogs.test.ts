import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import * as auditApi from '@/lib/api/audit'
import { createMockAuditEntry } from '@/__tests__/fixtures/audit-fixtures'

jest.mock('@/lib/api/audit')

beforeEach(() => jest.clearAllMocks())

describe('useAuditLogs', () => {
  it('fetches the requested category with filters', async () => {
    jest.mocked(auditApi.getAuditChangelog).mockResolvedValue({
      entries: [createMockAuditEntry()],
      total: 1,
      page: 1,
      page_size: 50,
    })
    const { result } = renderHook(() => useAuditLogs('employees', { page: 3, page_size: 20 }), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(auditApi.getAuditChangelog).toHaveBeenCalledWith('employees', {
      page: 3,
      page_size: 20,
    })
  })
})
