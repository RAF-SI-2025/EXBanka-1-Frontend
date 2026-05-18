import { EmployeeForm } from '@/views/employees/components/EmployeeForm'
import { BackButton } from '@/components/shared/BackButton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useMutationWithRedirect } from '@/hooks/useMutationWithRedirect'
import { createEmployee } from '@/lib/api/employees'
import type { CreateEmployeeRequest } from '@/types/employee'
import { ViewShell } from '@/views/shared'

export function CreateEmployeeView() {
  const mutation = useMutationWithRedirect({
    mutationFn: (data: CreateEmployeeRequest) => createEmployee(data),
    invalidateKeys: [['employees']],
    redirectTo: '/employees',
  })

  return (
    <ViewShell
      title={
        <span className="flex items-center gap-3">
          <BackButton to="/employees" />
          Create Employee
        </span>
      }
    >
      <EmployeeForm
        onSubmit={(data) => mutation.mutate(data as CreateEmployeeRequest)}
        isLoading={mutation.isPending}
      />
      {mutation.isError && <ErrorMessage message="Failed to create employee." />}
    </ViewShell>
  )
}
