import { useState } from 'react'
import { EmployeeForm } from '@/views/employees/components/EmployeeForm'
import { BackButton } from '@/components/shared/BackButton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useMutationWithRedirect } from '@/hooks/useMutationWithRedirect'
import { createEmployee } from '@/lib/api/employees'
import { isDuplicateEmailError, notifyError } from '@/lib/errors'
import type { CreateEmployeeRequest } from '@/types/employee'
import { ViewShell } from '@/views/shared'

export function CreateEmployeeView() {
  const [emailDuplicate, setEmailDuplicate] = useState<string | undefined>()

  const mutation = useMutationWithRedirect({
    mutationFn: (data: CreateEmployeeRequest) => createEmployee(data),
    invalidateKeys: [['employees']],
    redirectTo: '/employees',
    onError: (err) => {
      if (isDuplicateEmailError(err)) {
        setEmailDuplicate('Email is already in use')
        return
      }
      notifyError(err)
    },
  })

  const handleSubmit = (data: CreateEmployeeRequest) => {
    setEmailDuplicate(undefined)
    mutation.mutate(data)
  }

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
        onSubmit={(data) => handleSubmit(data as CreateEmployeeRequest)}
        isLoading={mutation.isPending}
        externalEmailError={emailDuplicate}
      />
      {mutation.isError && !emailDuplicate && <ErrorMessage message="Failed to create employee." />}
    </ViewShell>
  )
}
