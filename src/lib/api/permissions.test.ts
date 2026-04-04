import { apiClient } from '@/lib/api/axios'
import { getPermissions, setEmployeeRoles, setEmployeePermissions } from '@/lib/api/permissions'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPut = jest.mocked(apiClient.put)

beforeEach(() => jest.clearAllMocks())

describe('permissions API', () => {
  it('GET /api/permissions returns permissions list', async () => {
    const mockData = {
      permissions: [
        { id: 1, code: 'clients.read', description: 'View clients', category: 'clients' },
      ],
    }
    mockGet.mockResolvedValue({ data: mockData })

    const result = await getPermissions()

    expect(mockGet).toHaveBeenCalledWith('/api/permissions')
    expect(result).toEqual(mockData)
  })

  it('GET /api/permissions coerces null permissions to empty array', async () => {
    mockGet.mockResolvedValue({ data: { permissions: null } })

    const result = await getPermissions()

    expect(result).toEqual({ permissions: [] })
  })

  it('PUT /api/employees/:id/roles sets employee roles', async () => {
    const mockEmployee = {
      id: 3,
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: 631152000,
      gender: 'M',
      email: 'john.doe@bank.com',
      phone: '123456789',
      address: '123 Main St',
      username: 'johndoe',
      position: 'Loan Officer',
      department: 'Loans',
      active: true,
      role: 'EmployeeBasic',
      permissions: [],
    }
    mockPut.mockResolvedValue({ data: mockEmployee })

    const result = await setEmployeeRoles(3, ['EmployeeBasic'])

    expect(mockPut).toHaveBeenCalledWith('/api/employees/3/roles', {
      role_names: ['EmployeeBasic'],
    })
    expect(result).toEqual(mockEmployee)
  })

  it('PUT /api/employees/:id/permissions sets employee permissions', async () => {
    const mockEmployee = {
      id: 3,
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: 631152000,
      gender: 'M',
      email: 'john.doe@bank.com',
      phone: '123456789',
      address: '123 Main St',
      username: 'johndoe',
      position: 'Loan Officer',
      department: 'Loans',
      active: true,
      role: 'EmployeeBasic',
      permissions: ['clients.read'],
    }
    mockPut.mockResolvedValue({ data: mockEmployee })

    const result = await setEmployeePermissions(3, ['clients.read'])

    expect(mockPut).toHaveBeenCalledWith('/api/employees/3/permissions', {
      permission_codes: ['clients.read'],
    })
    expect(result).toEqual(mockEmployee)
  })
})
