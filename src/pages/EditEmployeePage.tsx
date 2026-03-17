import { useParams } from 'react-router-dom'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { BackButton } from '@/components/shared/BackButton'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useEmployee } from '@/hooks/useEmployee'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useMutationWithRedirect } from '@/hooks/useMutationWithRedirect'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { updateEmployee } from '@/lib/api/employees'
import type { UpdateEmployeeRequest } from '@/types/employee'

export function EditEmployeePage() {
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

  if (isLoading) return <LoadingSpinner />
  if (!employee) return <ErrorMessage message="Employee not found." />

  const title = isOtherAdmin
    ? 'Administrator Details'
    : isOwnProfile
      ? 'My Profile'
      : 'Edit Employee'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/employees" />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <EmployeeForm
        employee={employee}
        onSubmit={(data) => mutation.mutate(data as UpdateEmployeeRequest)}
        isLoading={mutation.isPending}
        readOnly={isOtherAdmin}
      />
      {mutation.isError && <ErrorMessage message="Failed to update employee." />}
    </div>
  )
}
