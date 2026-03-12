import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'

const mockOnSubmit = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('EmployeeForm', () => {
  it('renders all required fields for create mode', () => {
    renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
  })

  it('pre-fills fields in edit mode', () => {
    const employee = createMockEmployee({ first_name: 'Jane', last_name: 'Doe' })
    renderWithProviders(
      <EmployeeForm onSubmit={mockOnSubmit} isLoading={false} employee={employee} />
    )
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe')
  })

  it('disables non-editable fields in edit mode', () => {
    const employee = createMockEmployee()
    renderWithProviders(
      <EmployeeForm onSubmit={mockOnSubmit} isLoading={false} employee={employee} />
    )
    expect(screen.getByLabelText(/first name/i)).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByLabelText(/username/i)).toBeDisabled()
  })

  it('validates required fields in create mode', async () => {
    renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('renders gender as a dropdown, not a text input, in create mode', () => {
    renderWithProviders(<EmployeeForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.queryByRole('textbox', { name: /gender/i })).not.toBeInTheDocument()
    expect(screen.getByText('Select gender')).toBeInTheDocument()
  })

  it('pre-fills gender dropdown in edit mode', () => {
    const employee = createMockEmployee({ gender: 'Female' })
    renderWithProviders(
      <EmployeeForm onSubmit={mockOnSubmit} isLoading={false} employee={employee} />
    )
    expect(screen.getByText('Female')).toBeInTheDocument()
  })

  it('disables gender dropdown when readOnly', () => {
    const employee = createMockEmployee({ gender: 'Male' })
    renderWithProviders(
      <EmployeeForm onSubmit={mockOnSubmit} isLoading={false} employee={employee} readOnly />
    )
    const genderTrigger = screen.getByRole('combobox', { name: /gender/i })
    expect(genderTrigger).toBeDisabled()
  })
})
