import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { emailSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { AuthFormCard } from './AuthFormCard'

const schema = z.object({ email: emailSchema })
type FormData = z.infer<typeof schema>

interface PasswordResetRequestFormProps {
  onSubmit: (email: string) => void
  isLoading: boolean
  isSuccess?: boolean
  error?: string
}

export function PasswordResetRequestForm({
  onSubmit,
  isLoading,
  isSuccess,
  error,
}: PasswordResetRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <AuthFormCard
      title="Reset Password"
      isSuccess={isSuccess}
      error={error}
      successContent={
        <>
          <p className="text-sm">Reset link has been sent to your email.</p>
          <Link to="/login" className="text-primary underline text-sm">
            Back to login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((data) => onSubmit(data.email))} className="space-y-4">
        <FormField label="Email" id="email" error={errors.email?.message}>
          <Input id="email" type="text" {...register('email')} />
        </FormField>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        <div className="text-center text-sm">
          <Link to="/login" className="text-primary underline">
            Back to login
          </Link>
        </div>
      </form>
    </AuthFormCard>
  )
}
