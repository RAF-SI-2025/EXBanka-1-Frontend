import { act, renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useCollectTaxes, useTaxRecords } from '@/views/tax/hooks/useTax'
import { taxApi } from '@/views/tax/api/taxApi'
import { createMockTaxRecord } from '@/views/tax/__tests__/fixtures'

jest.mock('@/views/tax/api/taxApi', () => ({
  taxApi: {
    list: jest.fn(),
    collect: jest.fn(),
  },
}))

beforeEach(() => jest.clearAllMocks())

describe('useTaxRecords', () => {
  it('fetches tax records with no filters by default', async () => {
    const response = { tax_records: [createMockTaxRecord()], total_count: 1 }
    jest.mocked(taxApi.list).mockResolvedValue(response)

    const { result } = renderHook(() => useTaxRecords(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(taxApi.list).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { tax_records: [createMockTaxRecord()], total_count: 1 }
    jest.mocked(taxApi.list).mockResolvedValue(response)

    const filters = { user_type: 'client' as const, page: 1, page_size: 10 }
    const { result } = renderHook(() => useTaxRecords(filters), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(taxApi.list).toHaveBeenCalledWith(filters)
  })
})

describe('useCollectTaxes', () => {
  it('calls collect', async () => {
    const response = { collected_count: 5, total_collected_rsd: '3750.00', failed_count: 0 }
    jest.mocked(taxApi.collect).mockResolvedValue(response)

    const { result } = renderHook(() => useCollectTaxes(), { wrapper: createQueryWrapper() })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(taxApi.collect).toHaveBeenCalled()
  })
})
