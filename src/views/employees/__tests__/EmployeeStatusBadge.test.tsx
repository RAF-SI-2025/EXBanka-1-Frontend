import { render, screen } from '@testing-library/react'
import { EmployeeStatusBadge } from '@/views/employees/components/EmployeeStatusBadge'

describe('EmployeeStatusBadge', () => {
  it('shows "Active" for active employee', () => {
    render(<EmployeeStatusBadge active={true} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows "Inactive" for inactive employee', () => {
    render(<EmployeeStatusBadge active={false} />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
