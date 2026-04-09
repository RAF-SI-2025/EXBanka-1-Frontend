import { apiClient } from '@/lib/api/axios'
import { getEmployees, getEmployee, createEmployee, updateEmployee } from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)

beforeEach(() => jest.clearAllMocks())

describe('getEmployees', () => {
  it('fetches employees with filters', async () => {
    const response = { employees: [createMockEmployee()], total_count: 1 }
    mockGet.mockResolvedValue({ data: response })

    const result = await getEmployees({ email: 'jane', page: 1, page_size: 20 })

    expect(mockGet).toHaveBeenCalledWith('/api/v1/employees', {
      params: { email: 'jane', page: 1, page_size: 20 },
    })
    expect(result).toEqual(response)
  })
})

describe('getEmployee', () => {
  it('fetches single employee by ID', async () => {
    const employee = createMockEmployee({ id: 5 })
    mockGet.mockResolvedValue({ data: employee })

    const result = await getEmployee(5)

    expect(mockGet).toHaveBeenCalledWith('/api/v1/employees/5')
    expect(result).toEqual(employee)
  })
})

describe('createEmployee', () => {
  it('posts new employee data', async () => {
    const employee = createMockEmployee()
    const payload: CreateEmployeeRequest = {
      first_name: 'Jane',
      last_name: 'Doe',
      date_of_birth: 946684800,
      email: 'jane@test.com',
      username: 'jane.doe',
      role: 'EmployeeBasic',
    }
    mockPost.mockResolvedValue({ data: employee })

    const result = await createEmployee(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/v1/employees', payload)
    expect(result).toEqual(employee)
  })
})

describe('updateEmployee', () => {
  it('puts updated employee data', async () => {
    const employee = createMockEmployee({ last_name: 'Smith' })
    const payload: UpdateEmployeeRequest = { last_name: 'Smith' }
    mockPut.mockResolvedValue({ data: employee })

    const result = await updateEmployee(1, payload)

    expect(mockPut).toHaveBeenCalledWith('/api/v1/employees/1', payload)
    expect(result).toEqual(employee)
  })
})
