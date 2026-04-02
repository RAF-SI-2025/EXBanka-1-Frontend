import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EditEmployeePage } from '@/pages/EditEmployeePage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

beforeEach(() => jest.clearAllMocks())

describe('EditEmployeePage', () => {
  it('loads and displays employee data', async () => {
    const employee = createMockEmployee({ first_name: 'Jane', last_name: 'Doe' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Jane')
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
  })

  it('shows loading while fetching', () => {
    jest.mocked(employeesApi.getEmployee).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('has a back button that navigates to /employees', async () => {
    const employee = createMockEmployee({ first_name: 'Jane' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Jane')
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/employees')
  })

  it('back button shows only the arrow character without extra text', async () => {
    const employee = createMockEmployee({ first_name: 'Jane' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Jane')
    const backButton = screen.getByRole('button', { name: /back/i })
    expect(backButton.textContent).toBe('←')
  })

  it('shows read-only view when viewing a different admin', async () => {
    // Employee id=99, current user id=1 → different admin → read-only
    const adminEmployee = createMockEmployee({ id: 99, role: 'EmployeeAdmin', first_name: 'Boss' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(adminEmployee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/99',
      routePath: '/employees/:id',
    })

    await screen.findByText(/administrator profiles cannot be edited/i)
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('shows "Employee not found." when employee does not exist', async () => {
    jest
      .mocked(employeesApi.getEmployee)
      .mockResolvedValue(
        undefined as unknown as ReturnType<typeof employeesApi.getEmployee> extends Promise<infer T>
          ? T
          : never
      )

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/999',
      routePath: '/employees/:id',
    })

    await screen.findByText(/employee not found/i)
  })

  it('shows "My Profile" title when viewing own profile', async () => {
    // Current user id=1, employee id=1 → own profile
    const employee = createMockEmployee({ id: 1, first_name: 'Jane' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Jane')
    expect(screen.getByRole('heading', { name: /my profile/i })).toBeInTheDocument()
  })

  it('shows "Edit Employee" title when viewing a non-admin employee', async () => {
    // Employee id=2, current user id=1, role=EmployeeBasic → editable non-admin
    const employee = createMockEmployee({ id: 2, role: 'EmployeeBasic', first_name: 'Bob' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/2',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Bob')
    expect(screen.getByRole('heading', { name: /edit employee/i })).toBeInTheDocument()
  })

  it('shows "Administrator Details" title when viewing a different admin', async () => {
    const adminEmployee = createMockEmployee({ id: 99, role: 'EmployeeAdmin', first_name: 'Boss' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(adminEmployee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/99',
      routePath: '/employees/:id',
    })

    await screen.findByText(/administrator details/i)
  })

  it('submits form and navigates to /employees on success', async () => {
    // Provide a valid 13-digit jmbg so form passes validation
    const employee = createMockEmployee({ id: 2, first_name: 'Bob', jmbg: '1234567890123' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)
    jest.mocked(employeesApi.updateEmployee).mockResolvedValue(employee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/2',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Bob')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/employees'))
    expect(employeesApi.updateEmployee).toHaveBeenCalledWith(2, expect.any(Object))
  })

  it('shows error message when update fails', async () => {
    // Provide a valid 13-digit jmbg so form passes validation
    const employee = createMockEmployee({ id: 2, first_name: 'Bob', jmbg: '1234567890123' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)
    jest.mocked(employeesApi.updateEmployee).mockRejectedValue(new Error('Network error'))

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/2',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Bob')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await screen.findByText(/failed to update employee/i)
    expect(mockNavigate).not.toHaveBeenCalledWith('/employees')
  })
})
