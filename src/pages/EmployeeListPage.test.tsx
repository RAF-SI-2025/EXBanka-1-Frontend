import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('EmployeeListPage', () => {
  it('displays employees on load', async () => {
    jest.mocked(employeesApi.getEmployees).mockResolvedValue({
      employees: [createMockEmployee({ first_name: 'Jane', last_name: 'Doe' })],
      total_count: 1,
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    await screen.findByText('Jane Doe')
  })

  it('shows loading state', () => {
    jest.mocked(employeesApi.getEmployees).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('has a create employee button linking to /employees/new', async () => {
    jest.mocked(employeesApi.getEmployees).mockResolvedValue({
      employees: [],
      total_count: 0,
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    const link = await screen.findByRole('link', { name: /create employee/i })
    expect(link).toHaveAttribute('href', '/employees/new')
  })

  it('shows pagination when there are multiple pages', async () => {
    jest.mocked(employeesApi.getEmployees).mockResolvedValue({
      employees: [createMockEmployee()],
      total_count: 50,
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })

    await screen.findByText('Page 1 of 3')
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })
})
