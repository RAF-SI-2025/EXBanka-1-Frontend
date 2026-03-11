import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ActivationForm } from '@/components/auth/ActivationForm'
import { activateAccount } from '@/lib/api/auth'
import type { AccountActivationPayload } from '@/types/auth'

export function ActivationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const mutation = useMutation({
    mutationFn: (data: { password: string; confirm_password: string }) =>
      activateAccount({ token, ...data } as AccountActivationPayload),
  })

  return (
    <ActivationForm
      onSubmit={(data) => mutation.mutate(data)}
      isLoading={mutation.isPending}
      isSuccess={mutation.isSuccess}
      error={
        mutation.isError ? 'Failed to activate account. The link may have expired.' : undefined
      }
    />
  )
}
