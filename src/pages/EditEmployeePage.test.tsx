import { screen } from '@testing-library/react'
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

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
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
})
