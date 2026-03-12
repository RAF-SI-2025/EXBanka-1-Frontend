import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'

// Shared Select mock — see src/__tests__/mocks/select-mock.tsx
jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

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
