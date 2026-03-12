import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { emailSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  if (isSuccess) {
    return (
      <Card className="border-t-4 border-t-primary">
        <CardContent className="pt-6">
          <p className="text-center text-sm">Reset link has been sent to your email.</p>
          <div className="text-center mt-4">
            <Link to="/login" className="text-primary underline text-sm">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data.email))} className="space-y-4">
          {error && <div className="text-sm text-destructive text-center">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="text" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <div className="text-center text-sm">
            <Link to="/login" className="text-primary underline">
              Back to login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
