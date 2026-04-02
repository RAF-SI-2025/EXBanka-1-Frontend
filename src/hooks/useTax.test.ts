import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useTaxRecords, useCollectTaxes } from '@/hooks/useTax'
import * as taxApi from '@/lib/api/tax'
import { createMockTaxRecord } from '@/__tests__/fixtures/tax-fixtures'

jest.mock('@/lib/api/tax')

beforeEach(() => jest.clearAllMocks())

describe('useTaxRecords', () => {
  it('fetches tax records with no filters by default', async () => {
    const response = { tax_records: [createMockTaxRecord()], total_count: 1 }
    jest.mocked(taxApi.getTaxRecords).mockResolvedValue(response)

    const { result } = renderHook(() => useTaxRecords(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(taxApi.getTaxRecords).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { tax_records: [createMockTaxRecord()], total_count: 1 }
    jest.mocked(taxApi.getTaxRecords).mockResolvedValue(response)

    const filters = { user_type: 'client' as const, page: 1, page_size: 10 }
    const { result } = renderHook(() => useTaxRecords(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(taxApi.getTaxRecords).toHaveBeenCalledWith(filters)
  })
})

describe('useCollectTaxes', () => {
  it('calls collectTaxes', async () => {
    const response = { collected_count: 5, total_collected_rsd: '3750.00', failed_count: 0 }
    jest.mocked(taxApi.collectTaxes).mockResolvedValue(response)

    const { result } = renderHook(() => useCollectTaxes(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(taxApi.collectTaxes).toHaveBeenCalled()
  })
})
