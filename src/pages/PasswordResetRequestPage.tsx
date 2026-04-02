import { useMutation } from '@tanstack/react-query'
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm'
import { requestPasswordReset } from '@/lib/api/auth'

export function PasswordResetRequestPage() {
  const mutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  })

  return (
    <PasswordResetRequestForm
      onSubmit={(email) => mutation.mutate(email)}
      isLoading={mutation.isPending}
      isSuccess={mutation.isSuccess}
      error={mutation.isError ? 'Something went wrong. Please try again.' : undefined}
    />
  )
}
