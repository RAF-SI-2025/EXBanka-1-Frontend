import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { BackButton } from '@/components/shared/BackButton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useMutationWithRedirect } from '@/hooks/useMutationWithRedirect'
import { createEmployee } from '@/lib/api/employees'
import type { CreateEmployeeRequest } from '@/types/employee'

export function CreateEmployeePage() {
  const mutation = useMutationWithRedirect({
    mutationFn: (data: CreateEmployeeRequest) => createEmployee(data),
    invalidateKeys: [['employees']],
    redirectTo: '/employees',
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/employees" />
        <h1 className="text-2xl font-bold">Create Employee</h1>
      </div>
      <EmployeeForm
        onSubmit={(data) => mutation.mutate(data as CreateEmployeeRequest)}
        isLoading={mutation.isPending}
      />
      {mutation.isError && <ErrorMessage message="Failed to create employee." />}
    </div>
  )
}
