import { EmployeeCreateForm } from './EmployeeCreateForm'
import { EmployeeEditForm } from './EmployeeEditForm'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee'

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => void
  isLoading: boolean
  employee?: Employee
  readOnly?: boolean
}

export function EmployeeForm({ onSubmit, isLoading, employee, readOnly }: EmployeeFormProps) {
  if (employee) {
    return (
      <EmployeeEditForm
        employee={employee}
        onSubmit={(data) => onSubmit(data)}
        isLoading={isLoading}
        readOnly={readOnly}
      />
    )
  }

  return <EmployeeCreateForm onSubmit={(data) => onSubmit(data)} isLoading={isLoading} />
}
