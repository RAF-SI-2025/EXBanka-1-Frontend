import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeLimitsView } from '@/views/employeeLimits/EmployeeLimitsView'
import * as employeesApi from '@/lib/api/employees'
import * as limitsApi from '@/lib/api/limits'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')
jest.mock('@/lib/api/limits')

const mockEmployees = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: 946684800000,
    gender: 'M',
    email: 'john@test.com',
    phone: '123456',
    address: '123 Main St',
    username: 'johndoe',
    position: 'Manager',
    department: 'IT',
    active: true,
    role: 'EmployeeAdmin',
    permissions: [],
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    date_of_birth: 946684800000,
    gender: 'F',
    email: 'jane@test.com',
    phone: '654321',
    address: '456 Oak Ave',
    username: 'janesmith',
    position: 'Analyst',
    department: 'Finance',
    active: true,
    role: 'EmployeeStandard',
    permissions: [],
  },
]

const adminAuth = createMockAuthState({
  user: createMockAuthUser({
    permissions: ['employees.read', 'employees.update'],
  }),
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(employeesApi.getEmployees).mockResolvedValue({
    employees: mockEmployees,
    total_count: 2,
  })
  jest.mocked(limitsApi.getLimitTemplates).mockResolvedValue({
    templates: [],
  })
})

describe('EmployeeLimitsView', () => {
  it('renders page title', async () => {
    renderWithProviders(<EmployeeLimitsView />, {
      preloadedState: { auth: adminAuth },
    })
    expect(screen.getByRole('heading', { name: 'Employee Limits' })).toBeInTheDocument()
  })

  it('displays employees on load', async () => {
    renderWithProviders(<EmployeeLimitsView />, {
      preloadedState: { auth: adminAuth },
    })
    await screen.findByText('John Doe')
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(employeesApi.getEmployees).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<EmployeeLimitsView />, {
      preloadedState: { auth: adminAuth },
    })
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })

  it('shows Manage Templates button', async () => {
    renderWithProviders(<EmployeeLimitsView />, {
      preloadedState: { auth: adminAuth },
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage templates/i })).toBeInTheDocument()
    })
  })

  it('shows "No employees found." when API returns empty array', async () => {
    jest.mocked(employeesApi.getEmployees).mockResolvedValue({
      employees: [],
      total_count: 0,
    })
    renderWithProviders(<EmployeeLimitsView />, {
      preloadedState: { auth: adminAuth },
    })
    await screen.findByText('No employees found.')
  })
})
