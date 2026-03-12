import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

// Mock Base UI Select so we can control value changes in jsdom.
// Uses React context to pass onValueChange down to SelectItem without
// any render-time side effects (avoids react-hooks/globals lint rule).
jest.mock('@/components/ui/select', () => {
  const { createContext, useContext } = jest.requireActual<typeof import('react')>('react')

  const SelectContext = createContext<((v: string | null) => void) | undefined>(undefined)

  function Select({
    onValueChange,
    children,
  }: {
    value?: string
    onValueChange?: (v: string | null) => void
    children?: React.ReactNode
  }) {
    return <SelectContext.Provider value={onValueChange}>{children}</SelectContext.Provider>
  }

  function SelectTrigger({ children }: { children?: React.ReactNode }) {
    return (
      <button role="combobox" data-testid="select-trigger">
        {children}
      </button>
    )
  }

  function SelectContent({ children }: { children?: React.ReactNode }) {
    return <div data-testid="select-content">{children}</div>
  }

  function SelectItem({ value, children }: { value: string; children?: React.ReactNode }) {
    const onValueChange = useContext(SelectContext)
    return (
      <div role="option" data-value={value} onClick={() => onValueChange?.(value)}>
        {children}
      </div>
    )
  }

  function SelectValue() {
    return null
  }

  return { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
})

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
