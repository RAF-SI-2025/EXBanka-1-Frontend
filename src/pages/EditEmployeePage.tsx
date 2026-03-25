import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { BackButton } from '@/components/shared/BackButton'
import { useEmployee } from '@/hooks/useEmployee'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { updateEmployee } from '@/lib/api/employees'
import type { UpdateEmployeeRequest } from '@/types/employee'

export function EditEmployeePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const employeeId = Number(id)
  const currentUser = useAppSelector(selectCurrentUser)
  const { data: employee, isLoading } = useEmployee(employeeId)

  const isOwnProfile = currentUser?.id === employeeId
  const isOtherAdmin = employee?.role === 'EmployeeAdmin' && !isOwnProfile

  const mutation = useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => updateEmployee(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
      navigate('/employees')
    },
  })

  if (isLoading) return <p>Loading...</p>
  if (!employee) return <p>Employee not found.</p>

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
      {mutation.isError && <p className="text-destructive mt-2">Failed to update employee.</p>}
    </div>
  )
}
