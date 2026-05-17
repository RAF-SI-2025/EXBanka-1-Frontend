import { useSearchParams, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { PasswordResetForm } from '@/views/auth/components/PasswordResetForm'
import { resetPassword } from '@/lib/api/auth'
import type { PasswordResetPayload } from '@/types/auth'

export function PasswordResetView() {
  const [searchParams] = useSearchParams()
  const { token: pathToken } = useParams<{ token?: string }>()
  const token = searchParams.get('token') ?? pathToken ?? ''

  const mutation = useMutation({
    mutationFn: (data: { new_password: string; confirm_password: string }) =>
      resetPassword({ token, ...data } as PasswordResetPayload),
  })

  return (
    <PasswordResetForm
      onSubmit={(data) => mutation.mutate(data)}
      isLoading={mutation.isPending}
      isSuccess={mutation.isSuccess}
      error={mutation.isError ? 'Failed to reset password. The link may have expired.' : undefined}
    />
  )
}
