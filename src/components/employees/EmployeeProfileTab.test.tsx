import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeProfileTab } from '@/components/employees/EmployeeProfileTab'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('EmployeeProfileTab', () => {
  it('shows loading spinner while fetching', () => {
    jest.mocked(employeesApi.getEmployee).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<EmployeeProfileTab />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows error when employee data cannot be loaded', async () => {
    jest
      .mocked(employeesApi.getEmployee)
      .mockResolvedValue(
        undefined as unknown as ReturnType<typeof employeesApi.getEmployee> extends Promise<infer T>
          ? T
          : never
      )
    renderWithProviders(<EmployeeProfileTab />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText(/could not load your profile/i)
  })

  it('renders employee profile fields when loaded', async () => {
    const employee = createMockEmployee({
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      role: 'EmployeeBasic',
    })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)
    renderWithProviders(<EmployeeProfileTab />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane')
    expect(screen.getByText('Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('shows "not logged in" when there is no current user', () => {
    renderWithProviders(<EmployeeProfileTab />, {
      preloadedState: { auth: createMockAuthState({ user: null }) },
    })
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
  })
})
