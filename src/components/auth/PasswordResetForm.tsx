import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { passwordSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  if (isSuccess) {
    return (
      <Card className="border-t-4 border-t-primary">
        <CardContent className="pt-6 text-center space-y-4">
          <p className="text-sm">Password reset successfully.</p>
          <Link to="/login" className="text-primary underline text-sm">
            Log in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
          {error && <div className="text-sm text-destructive text-center">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input id="new_password" type="password" {...register('new_password')} />
            {errors.new_password && (
              <p className="text-sm text-destructive">{errors.new_password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input id="confirm_password" type="password" {...register('confirm_password')} />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
