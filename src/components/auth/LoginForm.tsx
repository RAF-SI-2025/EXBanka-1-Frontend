import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { loginSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { AuthFormCard } from './AuthFormCard'
import type { LoginRequest } from '@/types/auth'

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => void
  isLoading: boolean
  error?: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <AuthFormCard title="Log In" error={error}>
      <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
        <FormField label="Email" id="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register('email')} />
        </FormField>
        <FormField label="Password" id="password" error={errors.password?.message}>
          <Input id="password" type="password" {...register('password')} />
        </FormField>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>
        <div className="text-center text-sm">
          <Link to="/password-reset-request" className="text-primary underline">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthFormCard>
  )
}
