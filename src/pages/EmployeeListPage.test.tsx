import { screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('calls API with name filter when typing', async () => {
    jest.mocked(employeesApi.getEmployees).mockImplementation(async (filters = {}) => {
      if (filters.name === 'Jane') {
        return { employees: [allEmployees[0]], total_count: 1 }
      }
      return { employees: allEmployees, total_count: 3 }
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Jane' } })

    await waitFor(() =>
      expect(employeesApi.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane', page: 1, page_size: 20 })
      )
    )
    await screen.findByText('Jane Doe')
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument()
  })

  it('calls API without filter params when filter is cleared', async () => {
    jest.mocked(employeesApi.getEmployees).mockImplementation(async (filters = {}) => {
      if (filters.name === 'Jane') {
        return { employees: [allEmployees[0]], total_count: 1 }
      }
      return { employees: allEmployees, total_count: 3 }
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Jane' } })
    await waitFor(() => expect(screen.queryByText('John Smith')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /clear filter/i }))

    await waitFor(() =>
      expect(employeesApi.getEmployees).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, page_size: 20 })
      )
    )
    await screen.findByText('John Smith')
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
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('fetches with page and page_size on initial load', async () => {
    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')
    expect(employeesApi.getEmployees).toHaveBeenCalledWith({ page: 1, page_size: 20 })
  })

  it('calls API with email filter when category is changed to email', async () => {
    jest.mocked(employeesApi.getEmployees).mockImplementation(async (filters = {}) => {
      if (filters.email === 'john@test.com') {
        return { employees: [allEmployees[1]], total_count: 1 }
      }
      return { employees: allEmployees, total_count: 3 }
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    fireEvent.click(screen.getByRole('option', { name: /email/i }))
    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'john@test.com' } })

    await waitFor(() =>
      expect(employeesApi.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'john@test.com', page: 1, page_size: 20 })
      )
    )
  })

  it('calls API with position filter when category is changed to position', async () => {
    jest.mocked(employeesApi.getEmployees).mockImplementation(async (filters = {}) => {
      if (filters.position === 'Manager') {
        return { employees: [allEmployees[1]], total_count: 1 }
      }
      return { employees: allEmployees, total_count: 3 }
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    fireEvent.click(screen.getByRole('option', { name: /position/i }))
    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'Manager' } })

    await waitFor(() =>
      expect(employeesApi.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ position: 'Manager', page: 1, page_size: 20 })
      )
    )
    await screen.findByText('John Smith')
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })

  it('shows "No employees found." when API returns empty array', async () => {
    jest.mocked(employeesApi.getEmployees).mockImplementation(async (filters = {}) => {
      if (filters.name === 'ZZZZZ') {
        return { employees: [], total_count: 0 }
      }
      return { employees: allEmployees, total_count: 3 }
    })

    renderWithProviders(<EmployeeListPage />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await screen.findByText('Jane Doe')

    const filterInput = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(filterInput, { target: { value: 'ZZZZZ' } })

    await screen.findByText('No employees found.')
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })
})

describe('EmployeeListPage — pagination', () => {
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
    jest.mocked(employeesApi.getEmployees).mockImplementation(async (filters = {}) => {
      if (filters.page === 2) {
        return { employees: employees25.slice(20), total_count: 25 }
      }
      return { employees: employees25.slice(0, 20), total_count: 25 }
    })
  })

  it('shows pagination controls when total_count > PAGE_SIZE', async () => {
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

    await screen.findByText('Employee PageTwo1')
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
    await screen.findByText(/page 2 of 2/i)

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    await screen.findByText('Employee PageOne1')
    expect(screen.queryByText('Employee PageTwo1')).not.toBeInTheDocument()
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })
})
