import { apiClient } from '@/lib/api/axios'
import {
  getRoles,
  getRole,
  getPermissions,
  createRole,
  updateRolePermissions,
  setEmployeeRoles,
  setEmployeePermissions,
} from '@/lib/api/roles'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)

beforeEach(() => jest.clearAllMocks())

describe('roles API', () => {
  it('GET /api/roles returns roles list', async () => {
    const mockData = { roles: [{ id: 1, name: 'EmployeeBasic', description: '', permissions: [] }] }
    mockGet.mockResolvedValue({ data: mockData })

    const result = await getRoles()

    expect(mockGet).toHaveBeenCalledWith('/api/roles')
    expect(result).toEqual(mockData)
  })

  it('GET /api/roles/:id returns single role', async () => {
    const mockRole = { id: 1, name: 'EmployeeBasic', description: '', permissions: [] }
    mockGet.mockResolvedValue({ data: mockRole })

    const result = await getRole(1)

    expect(mockGet).toHaveBeenCalledWith('/api/roles/1')
    expect(result).toEqual(mockRole)
  })

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

  it('POST /api/roles creates a role', async () => {
    const payload = { name: 'TestRole', permission_codes: ['clients.read'] }
    const mockRole = { id: 5, name: 'TestRole', description: '', permissions: ['clients.read'] }
    mockPost.mockResolvedValue({ data: mockRole })

    const result = await createRole(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/roles', payload)
    expect(result).toEqual(mockRole)
  })

  it('PUT /api/roles/:id/permissions updates role permissions', async () => {
    const mockRole = { id: 1, name: 'EmployeeBasic', permissions: ['clients.read'] }
    mockPut.mockResolvedValue({ data: mockRole })

    const result = await updateRolePermissions(1, ['clients.read'])

    expect(mockPut).toHaveBeenCalledWith('/api/roles/1/permissions', {
      permission_codes: ['clients.read'],
    })
    expect(result).toEqual(mockRole)
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
