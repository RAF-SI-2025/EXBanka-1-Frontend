import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useActuaries,
  useSetActuaryLimit,
  useResetActuaryLimit,
  useSetActuaryApproval,
} from '@/hooks/useActuaries'
import * as actuariesApi from '@/lib/api/actuaries'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'

jest.mock('@/lib/api/actuaries')

beforeEach(() => jest.clearAllMocks())

describe('useActuaries', () => {
  it('fetches actuaries with no filters by default', async () => {
    const response = { actuaries: [createMockActuary()], total_count: 1 }
    jest.mocked(actuariesApi.getActuaries).mockResolvedValue(response)

    const { result } = renderHook(() => useActuaries(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(actuariesApi.getActuaries).toHaveBeenCalledWith({})
  })

  it('passes filters to the API', async () => {
    const response = { actuaries: [createMockActuary()], total_count: 1 }
    jest.mocked(actuariesApi.getActuaries).mockResolvedValue(response)

    const filters = { search: 'Smith', page: 1, page_size: 10 }
    const { result } = renderHook(() => useActuaries(filters), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(actuariesApi.getActuaries).toHaveBeenCalledWith(filters)
  })
})

describe('useSetActuaryLimit', () => {
  it('calls setActuaryLimit and invalidates query', async () => {
    const actuary = createMockActuary({ limit: '200000.00' })
    jest.mocked(actuariesApi.setActuaryLimit).mockResolvedValue(actuary)

    const { result } = renderHook(() => useSetActuaryLimit(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 1, payload: { limit: '200000.00' } })
    })

    expect(actuariesApi.setActuaryLimit).toHaveBeenCalledWith(1, { limit: '200000.00' })
  })
})

describe('useResetActuaryLimit', () => {
  it('calls resetActuaryLimit', async () => {
    const actuary = createMockActuary({ used_limit: '0' })
    jest.mocked(actuariesApi.resetActuaryLimit).mockResolvedValue(actuary)

    const { result } = renderHook(() => useResetActuaryLimit(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(actuariesApi.resetActuaryLimit).toHaveBeenCalledWith(1)
  })
})

describe('useSetActuaryApproval', () => {
  it('calls setActuaryApproval', async () => {
    const actuary = createMockActuary({ need_approval: false })
    jest.mocked(actuariesApi.setActuaryApproval).mockResolvedValue(actuary)

    const { result } = renderHook(() => useSetActuaryApproval(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 1, payload: { need_approval: false } })
    })

    expect(actuariesApi.setActuaryApproval).toHaveBeenCalledWith(1, { need_approval: false })
  })
})
