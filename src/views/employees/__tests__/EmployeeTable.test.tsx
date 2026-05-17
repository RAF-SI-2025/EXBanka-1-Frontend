import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeTable } from '@/views/employees/components/EmployeeTable'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'

describe('EmployeeTable', () => {
  const employees = [
    createMockEmployee({
      id: 1,
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@test.com',
      active: true,
    }),
    createMockEmployee({
      id: 2,
      first_name: 'John',
      last_name: 'Smith',
      email: 'john@test.com',
      active: false,
    }),
  ]

  it('renders table headers', () => {
    renderWithProviders(<EmployeeTable employees={employees} onRowClick={jest.fn()} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Position')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders employee rows', () => {
    renderWithProviders(<EmployeeTable employees={employees} onRowClick={jest.fn()} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('john@test.com')).toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', async () => {
    const onRowClick = jest.fn()
    renderWithProviders(<EmployeeTable employees={employees} onRowClick={onRowClick} />)
    await userEvent.click(screen.getByText('Jane Doe'))
    expect(onRowClick).toHaveBeenCalledWith(1)
  })

  it('shows active/inactive badges', () => {
    renderWithProviders(<EmployeeTable employees={employees} onRowClick={jest.fn()} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
