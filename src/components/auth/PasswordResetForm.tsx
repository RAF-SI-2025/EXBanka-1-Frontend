import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { passwordSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { AuthFormCard } from './AuthFormCard'

const schema = z
  .object({
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

interface PasswordResetFormProps {
  onSubmit: (data: { new_password: string; confirm_password: string }) => void
  isLoading: boolean
  isSuccess?: boolean
  error?: string
}

export function PasswordResetForm({
  onSubmit,
  isLoading,
  isSuccess,
  error,
}: PasswordResetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <AuthFormCard
      title="Set New Password"
      isSuccess={isSuccess}
      error={error}
      successContent={
        <>
          <p className="text-sm">Password reset successfully.</p>
          <Link to="/login" className="text-primary underline text-sm">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
        <FormField label="New Password" id="new_password" error={errors.new_password?.message}>
          <Input id="new_password" type="password" {...register('new_password')} />
        </FormField>
        <FormField
          label="Confirm Password"
          id="confirm_password"
          error={errors.confirm_password?.message}
        >
          <Input id="confirm_password" type="password" {...register('confirm_password')} />
        </FormField>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </AuthFormCard>
  )
}
