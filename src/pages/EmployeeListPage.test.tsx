import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

// Shared Select mock — see src/__tests__/mocks/select-mock.tsx
jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

jest.mock('@/lib/api/employees')

const allEmployees = [
  createMockEmployee({
    id: 1,
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@test.com',
    position: 'Teller',
  }),
  createMockEmployee({
    id: 2,
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@test.com',
    position: 'Manager',
  }),
  createMockEmployee({
    id: 3,
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice@test.com',
    position: 'Teller',
  }),
]

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(employeesApi.getEmployees).mockResolvedValue({
    employees: allEmployees,
    total_count: 3,
  })
})

describe('EmployeeListPage', () => {
  it('displays all employees on load', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
  })

  it('filters employees locally by first name', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Jane' } })

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument()
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
  })

  it('shows all employees when filter is cleared', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Jane' } })
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /clear filter/i }))

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
  })

  it('has a create employee button linking to /employees/new', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    const link = await screen.findByRole('link', { name: /create employee/i })
    expect(link).toHaveAttribute('href', '/employees/new')
  })

  it('shows loading state', () => {
    jest.mocked(employeesApi.getEmployees).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('fetches employees without filter or pagination params', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')
    expect(employeesApi.getEmployees).toHaveBeenCalledWith({})
  })

  it('shows "No employees found." when filter matches nothing', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'ZZZZZ' } })

    expect(screen.getByText('No employees found.')).toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })

  it('filters employees by position when category is changed', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    // Switch category to Position using the mocked Select
    const positionOption = screen.getByRole('option', { name: /position/i })
    fireEvent.click(positionOption)

    // Filter by "Manager"
    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Manager' } })

    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
  })
})

describe('EmployeeListPage — pagination', () => {
  // Generate 25 employees: first 20 have last_name "PageOne", last 5 have last_name "PageTwo"
  const employees25 = Array.from({ length: 25 }, (_, i) =>
    createMockEmployee({
      id: i + 1,
      first_name: `Employee`,
      last_name: i < 20 ? `PageOne${i + 1}` : `PageTwo${i - 19}`,
      email: `emp${i + 1}@test.com`,
    })
  )

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(employeesApi.getEmployees).mockResolvedValue({
      employees: employees25,
      total_count: 25,
    })
  })

  it('shows pagination controls when there are more than 20 employees', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Employee PageOne1')
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('shows the first 20 employees on page 1', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Employee PageOne1')
    expect(screen.getByText('Employee PageOne20')).toBeInTheDocument()
    expect(screen.queryByText('Employee PageTwo1')).not.toBeInTheDocument()
  })

  it('navigates to page 2 showing the remaining 5 employees when Next is clicked', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Employee PageOne1')

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Employee PageTwo1')).toBeInTheDocument()
    expect(screen.getByText('Employee PageTwo5')).toBeInTheDocument()
    expect(screen.queryByText('Employee PageOne1')).not.toBeInTheDocument()
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument()
  })

  it('navigates back to page 1 when Previous is clicked from page 2', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Employee PageOne1')

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(screen.getByText('Employee PageOne1')).toBeInTheDocument()
    expect(screen.queryByText('Employee PageTwo1')).not.toBeInTheDocument()
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })
})
