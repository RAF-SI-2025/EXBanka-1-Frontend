import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminRolesPage } from '@/pages/AdminRolesPage'
import * as rolesApi from '@/lib/api/roles'
import * as permissionsApi from '@/lib/api/permissions'
import type { Role, Permission } from '@/types/roles'

jest.mock('@/lib/api/roles')
jest.mock('@/lib/api/permissions')

const mockPermissions: Permission[] = [
  { id: 1, code: 'accounts.read', description: 'Read accounts', category: 'accounts' },
  { id: 2, code: 'accounts.write', description: 'Write accounts', category: 'accounts' },
  { id: 3, code: 'users.read', description: 'Read users', category: 'users' },
  { id: 4, code: 'users.write', description: 'Write users', category: 'users' },
]

const mockRoles: Role[] = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full access',
    permissions: ['accounts.read', 'accounts.write'],
  },
  { id: 2, name: 'Viewer', description: 'Read-only access', permissions: ['accounts.read'] },
]

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(rolesApi.getRoles).mockResolvedValue({ roles: mockRoles })
  jest.mocked(permissionsApi.getPermissions).mockResolvedValue({ permissions: mockPermissions })
})

describe('AdminRolesPage', () => {
  it('renders roles table with role data', async () => {
    renderWithProviders(<AdminRolesPage />)

    await screen.findByText('Admin')
    expect(screen.getByText('Full access')).toBeInTheDocument()
    expect(screen.getByText('Viewer')).toBeInTheDocument()
    expect(screen.getByText('Read-only access')).toBeInTheDocument()
  })

  it('shows permission counts for each role', async () => {
    renderWithProviders(<AdminRolesPage />)

    await screen.findByText('Admin')
    expect(screen.getByText('2 permissions')).toBeInTheDocument()
    expect(screen.getByText('1 permission')).toBeInTheDocument()
  })

  it('shows permissions tab with all permissions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminRolesPage />)

    await screen.findByText('Admin')

    const permissionsTab = screen.getByRole('tab', { name: /all permissions/i })
    await user.click(permissionsTab)

    await waitFor(() => {
      expect(screen.getByText('accounts.read')).toBeInTheDocument()
      expect(screen.getByText('accounts.write')).toBeInTheDocument()
      expect(screen.getByText('users.read')).toBeInTheDocument()
      expect(screen.getByText('users.write')).toBeInTheDocument()
    })
  })

  it('shows loading spinner while data loads', () => {
    jest.mocked(rolesApi.getRoles).mockReturnValue(new Promise(() => {}))
    jest.mocked(permissionsApi.getPermissions).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<AdminRolesPage />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows "No roles found." when there are no roles', async () => {
    jest.mocked(rolesApi.getRoles).mockResolvedValue({ roles: [] })

    renderWithProviders(<AdminRolesPage />)

    await screen.findByText('No roles found.')
  })

  it('renders Create Role button', async () => {
    renderWithProviders(<AdminRolesPage />)

    await screen.findByText('Admin')
    expect(screen.getByRole('button', { name: /create role/i })).toBeInTheDocument()
  })

  it('renders Edit Permissions buttons for each role', async () => {
    renderWithProviders(<AdminRolesPage />)

    await screen.findByText('Admin')
    const editButtons = screen.getAllByRole('button', { name: /edit permissions/i })
    expect(editButtons).toHaveLength(2)
  })
})
