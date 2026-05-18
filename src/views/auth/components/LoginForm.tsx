import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { loginSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { AuthFormCard } from '@/views/auth/components/AuthFormCard'
import type { LoginRequest } from '@/types/auth'

const ADMIN_QUICK_LOGIN: LoginRequest = {
  email: 'admin+testadmin@admin.com',
  password: 'AdminAdmin2026!.',
}

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => void
  isLoading: boolean
  error?: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  })

  const handleSecretAdminLogin = () => {
    setValue('email', ADMIN_QUICK_LOGIN.email, { shouldValidate: true })
    setValue('password', ADMIN_QUICK_LOGIN.password, { shouldValidate: true })
    onSubmit(ADMIN_QUICK_LOGIN)
  }

  return (
    <AuthFormCard title="Log In" error={error} onTitleClick={handleSecretAdminLogin}>
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
