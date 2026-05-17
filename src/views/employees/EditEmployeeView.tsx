import { useParams } from 'react-router-dom'
import { EmployeeForm } from '@/views/employees/components/EmployeeForm'
import { BackButton } from '@/components/shared/BackButton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useEmployee } from '@/hooks/useEmployee'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useMutationWithRedirect } from '@/hooks/useMutationWithRedirect'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { updateEmployee } from '@/lib/api/employees'
import type { UpdateEmployeeRequest } from '@/types/employee'
import { LoadingState, ViewShell } from '@/views/shared'

export function EditEmployeeView() {
  const { id } = useParams<{ id: string }>()
  const employeeId = Number(id)
  const currentUser = useAppSelector(selectCurrentUser)
  const { data: employee, isLoading } = useEmployee(employeeId)

  const isOwnProfile = currentUser?.id === employeeId
  const isOtherAdmin = employee?.role === 'EmployeeAdmin' && !isOwnProfile

  const mutation = useMutationWithRedirect({
    mutationFn: (data: UpdateEmployeeRequest) => updateEmployee(employeeId, data),
    invalidateKeys: [['employees']],
    redirectTo: '/employees',
  })

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (!employee) {
    return (
      <ViewShell title="Employee">
        <ErrorMessage message="Employee not found." />
      </ViewShell>
    )
  }

  const title = isOtherAdmin
    ? 'Administrator Details'
    : isOwnProfile
      ? 'My Profile'
      : 'Edit Employee'

  return (
    <ViewShell
      title={
        <span className="flex items-center gap-3">
          <BackButton to="/employees" />
          {title}
        </span>
      }
    >
      <EmployeeForm
        employee={employee}
        onSubmit={(data) => mutation.mutate(data as UpdateEmployeeRequest)}
        isLoading={mutation.isPending}
        readOnly={isOtherAdmin}
      />
      {mutation.isError && <ErrorMessage message="Failed to update employee." />}
    </ViewShell>
  )
}
