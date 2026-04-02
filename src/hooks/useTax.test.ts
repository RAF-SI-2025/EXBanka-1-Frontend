import { renderHook, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useTaxRecords, useCollectTaxes } from '@/hooks/useTax'
import * as taxApi from '@/lib/api/tax'

jest.mock('@/lib/api/tax')

const mockGetTaxRecords = jest.mocked(taxApi.getTaxRecords)
const mockCollectTaxes = jest.mocked(taxApi.collectTaxes)

beforeEach(() => jest.clearAllMocks())

describe('useTaxRecords', () => {
  it('calls getTaxRecords with provided filters', async () => {
    mockGetTaxRecords.mockResolvedValue({ tax_records: [], total_count: 0 })
    const filters = { user_type: 'client' as const, search: 'Marko' }
    renderHook(() => useTaxRecords(filters), { wrapper: createQueryWrapper() })
    await act(async () => {})
    expect(mockGetTaxRecords).toHaveBeenCalledWith(filters)
  })
})

describe('useCollectTaxes', () => {
  it('calls collectTaxes on mutate and returns result', async () => {
    mockCollectTaxes.mockResolvedValue({
      collected_count: 3,
      total_collected_rsd: '15000.00',
      failed_count: 0,
    })
    const { result } = renderHook(() => useCollectTaxes(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.mutate()
    })
    expect(mockCollectTaxes).toHaveBeenCalled()
  })
})
