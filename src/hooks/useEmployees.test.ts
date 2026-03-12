import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useEmployees } from '@/hooks/useEmployees'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('useEmployees', () => {
  it('fetches all employees without filter params', async () => {
    const response = { employees: [createMockEmployee()], total_count: 1 }
    jest.mocked(employeesApi.getEmployees).mockResolvedValue(response)

    const { result } = renderHook(() => useEmployees(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(employeesApi.getEmployees).toHaveBeenCalledWith({})
  })
})
