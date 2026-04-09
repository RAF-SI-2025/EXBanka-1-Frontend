import { apiClient } from '@/lib/api/axios'
import { getRoles, getRole, createRole, updateRolePermissions } from '@/lib/api/roles'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)

beforeEach(() => jest.clearAllMocks())

describe('roles API', () => {
  it('GET /api/roles returns roles list', async () => {
    const mockData = {
      roles: [{ id: 1, name: 'EmployeeBasic', description: '', permissions: [] }],
    }
    mockGet.mockResolvedValue({ data: mockData })

    const result = await getRoles()

    expect(mockGet).toHaveBeenCalledWith('/api/v1/roles')
    expect(result).toEqual(mockData)
  })

  it('GET /api/roles coerces null roles to empty array', async () => {
    mockGet.mockResolvedValue({ data: { roles: null } })

    const result = await getRoles()

    expect(result).toEqual({ roles: [] })
  })

  it('GET /api/roles/:id returns single role', async () => {
    const mockRole = { id: 1, name: 'EmployeeBasic', description: '', permissions: [] }
    mockGet.mockResolvedValue({ data: mockRole })

    const result = await getRole(1)

    expect(mockGet).toHaveBeenCalledWith('/api/v1/roles/1')
    expect(result).toEqual(mockRole)
  })

  it('POST /api/roles creates a role', async () => {
    const payload = { name: 'TestRole', permission_codes: ['clients.read'] }
    const mockRole = {
      id: 5,
      name: 'TestRole',
      description: '',
      permissions: ['clients.read'],
    }
    mockPost.mockResolvedValue({ data: mockRole })

    const result = await createRole(payload)

    expect(mockPost).toHaveBeenCalledWith('/api/v1/roles', payload)
    expect(result).toEqual(mockRole)
  })

  it('PUT /api/roles/:id/permissions updates role permissions', async () => {
    const mockRole = { id: 1, name: 'EmployeeBasic', permissions: ['clients.read'] }
    mockPut.mockResolvedValue({ data: mockRole })

    const result = await updateRolePermissions(1, ['clients.read'])

    expect(mockPut).toHaveBeenCalledWith('/api/v1/roles/1/permissions', {
      permission_codes: ['clients.read'],
    })
    expect(result).toEqual(mockRole)
  })
})
