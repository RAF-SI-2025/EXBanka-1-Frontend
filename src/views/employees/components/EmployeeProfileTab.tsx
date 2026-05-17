import { useAppSelector } from '@/hooks/useAppSelector'
import { useEmployee } from '@/hooks/useEmployee'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { formatDateLocale } from '@/lib/utils/dateFormatter'

export function EmployeeProfileTab() {
  const currentUser = useAppSelector(selectCurrentUser)
  const { data: employee, isLoading } = useEmployee(currentUser?.id ?? 0)

  if (!currentUser) return <p className="text-muted-foreground">Not logged in.</p>
  if (isLoading) return <LoadingSpinner />
  if (!employee) return <ErrorMessage message="Could not load your profile." />

  const rows: { label: string; value: string | boolean | undefined }[] = [
    { label: 'First Name', value: employee.first_name },
    { label: 'Last Name', value: employee.last_name },
    { label: 'Email', value: employee.email },
    { label: 'Username', value: employee.username },
    { label: 'Date of Birth', value: formatDateLocale(employee.date_of_birth) },
    { label: 'Gender', value: employee.gender },
    { label: 'Phone', value: employee.phone },
    { label: 'Address', value: employee.address },
    { label: 'Position', value: employee.position },
    { label: 'Department', value: employee.department },
    { label: 'Role', value: employee.role },
    { label: 'Status', value: employee.active ? 'Active' : 'Inactive' },
    { label: 'JMBG', value: employee.jmbg },
  ]

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold mb-4">My Profile</h2>
      <dl className="divide-y divide-border rounded-lg border overflow-hidden">
        {rows.map(({ label, value }) =>
          value !== undefined && value !== '' && value !== null ? (
            <div key={label} className="flex px-4 py-2.5 gap-4">
              <dt className="w-36 shrink-0 text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium">{String(value)}</dd>
            </div>
          ) : null
        )}
      </dl>
    </div>
  )
}
