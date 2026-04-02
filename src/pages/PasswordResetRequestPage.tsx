import { useMutation } from '@tanstack/react-query'
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm'
import { requestPasswordReset } from '@/lib/api/auth'
import peopleWalkingGif from '@/assets/people-walking.gif'

export function PasswordResetRequestPage() {
  const mutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  })

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${peopleWalkingGif})` }}
    >
      <div className="w-full max-w-md p-4">
        <PasswordResetRequestForm
          onSubmit={(email) => mutation.mutate(email)}
          isLoading={mutation.isPending}
          isSuccess={mutation.isSuccess}
          error={mutation.isError ? 'Something went wrong. Please try again.' : undefined}
        />
      </div>
    </div>
  )
}
