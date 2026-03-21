import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/FormField'
import { PhoneInput } from './PhoneInput'
import { EMPLOYEE_ROLES as ROLES, GENDERS, formatRoleLabel } from '@/lib/utils/constants'
import { todayISO } from '@/lib/utils/dateFormatter'
import type { CreateEmployeeRequest } from '@/types/employee'

const createFormSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(20, 'First name must be at most 20 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be at most 20 characters'),
  date_of_birth: z
    .string()
    .optional()
    .refine((val) => !val || new Date(val) <= new Date(), 'Date of birth cannot be in the future'),
  gender: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(15, 'Phone number must be at most 15 digits').optional(),
  address: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  position: z.string().optional(),
  department: z.string().optional(),
  role: z
    .enum(['EmployeeBasic', 'EmployeeAgent', 'EmployeeSupervisor', 'EmployeeAdmin'], {
      message: 'Role is required',
    })
    .optional(),
  active: z.boolean().optional(),
  jmbg: z.string().regex(/^\d{13}$/, 'JMBG must be exactly 13 digits'),
})

type CreateFormData = z.infer<typeof createFormSchema>

interface EmployeeCreateFormProps {
  onSubmit: (data: CreateEmployeeRequest) => void
  isLoading: boolean
}

export function EmployeeCreateForm({ onSubmit, isLoading }: EmployeeCreateFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { active: true },
  })

  const role = watch('role')
  const active = watch('active') ?? true
  const phone = watch('phone') ?? ''
  const gender = watch('gender')

  const handleCreateSubmit = (data: CreateFormData) => {
    const timestamp = data.date_of_birth
      ? Math.floor(new Date(data.date_of_birth).getTime() / 1000)
      : 0
    onSubmit({
      ...data,
      date_of_birth: timestamp,
      jmbg: data.jmbg,
    } as CreateEmployeeRequest)
  }

  return (
    <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
      <FormField label="First Name" id="first_name" error={errors.first_name?.message}>
        <Input id="first_name" {...register('first_name')} maxLength={20} />
      </FormField>

      <FormField label="Last Name" id="last_name" error={errors.last_name?.message}>
        <Input id="last_name" {...register('last_name')} maxLength={20} />
      </FormField>

      <FormField label="Date of Birth" id="date_of_birth" error={errors.date_of_birth?.message}>
        <Input id="date_of_birth" type="date" max={todayISO()} {...register('date_of_birth')} />
      </FormField>

      <FormField label="Gender" id="gender">
        <Select value={gender ?? ''} onValueChange={(val) => setValue('gender', val || undefined)}>
          <SelectTrigger id="gender" aria-label="Gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDERS.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Email" id="email" error={errors.email?.message}>
        <Input id="email" type="email" {...register('email')} />
      </FormField>

      <FormField label="Phone" error={errors.phone?.message}>
        <PhoneInput value={phone} onChange={(val) => setValue('phone', val)} />
      </FormField>

      <FormField label="Address" id="address">
        <Input id="address" {...register('address')} />
      </FormField>

      <FormField label="Username" id="username" error={errors.username?.message}>
        <Input id="username" {...register('username')} />
      </FormField>

      <FormField label="Position" id="position">
        <Input id="position" {...register('position')} />
      </FormField>

      <FormField label="Department" id="department">
        <Input id="department" {...register('department')} />
      </FormField>

      <FormField label="JMBG" id="jmbg" error={errors.jmbg?.message}>
        <Input
          id="jmbg"
          {...register('jmbg')}
          placeholder="13-digit JMBG"
          maxLength={13}
          inputMode="numeric"
        />
      </FormField>

      <FormField label="Status" id="status">
        <Select
          value={active ? 'active' : 'inactive'}
          onValueChange={(val) => setValue('active', val === 'active')}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Role" id="role" error={errors.role?.message}>
        <Select
          value={role}
          onValueChange={(val) => setValue('role', val as (typeof ROLES)[number])}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {formatRoleLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
