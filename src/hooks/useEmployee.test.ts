import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useEmployee } from '@/hooks/useEmployee'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('useEmployee', () => {
  it('fetches single employee by ID', async () => {
    const employee = createMockEmployee({ id: 5 })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)

    const { result } = renderHook(() => useEmployee(5), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(employee)
    expect(employeesApi.getEmployee).toHaveBeenCalledWith(5)
  })

  it('does not fetch when id is 0', () => {
    const { result } = renderHook(() => useEmployee(0), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(employeesApi.getEmployee).not.toHaveBeenCalled()
  })

  it('does not fetch when options.enabled is false', () => {
    const { result } = renderHook(() => useEmployee(5, { enabled: false }), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(employeesApi.getEmployee).not.toHaveBeenCalled()
  })
})
