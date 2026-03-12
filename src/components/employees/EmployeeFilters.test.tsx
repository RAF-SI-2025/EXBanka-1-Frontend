import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'

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

const mockOnFilterChange = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('EmployeeFilters', () => {
  it('renders category dropdown and text input', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/type to filter/i)).toBeInTheDocument()
  })

  it('calls onFilterChange with default category and typed value', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: 'first_name',
      value: 'Jane',
    })
  })

  it('does not show clear button when input is empty', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    expect(screen.queryByRole('button', { name: /clear filter/i })).not.toBeInTheDocument()
  })

  it('shows clear button when text is entered', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    expect(screen.getByRole('button', { name: /clear filter/i })).toBeInTheDocument()
  })

  it('clears input and calls onFilterChange(null) when clear is clicked', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    mockOnFilterChange.mockClear()

    fireEvent.click(screen.getByRole('button', { name: /clear filter/i }))

    expect(input).toHaveValue('')
    expect(mockOnFilterChange).toHaveBeenCalledWith(null)
  })

  it('calls onFilterChange(null) when input is cleared by typing', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    mockOnFilterChange.mockClear()

    fireEvent.change(input, { target: { value: '' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith(null)
  })

  it('updates category and re-emits filter when category changes with non-empty input', () => {
    renderWithProviders(<EmployeeFilters onFilterChange={mockOnFilterChange} />)
    const input = screen.getByPlaceholderText(/type to filter/i)
    fireEvent.change(input, { target: { value: 'jane@test.com' } })
    mockOnFilterChange.mockClear()

    // Click the Email option via the mocked Select
    const emailOption = screen.getByRole('option', { name: /email/i })
    fireEvent.click(emailOption)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: 'email',
      value: 'jane@test.com',
    })
  })
})
