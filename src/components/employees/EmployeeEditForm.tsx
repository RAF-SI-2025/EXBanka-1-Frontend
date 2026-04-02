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
import { updateEmployeeSchema } from '@/lib/utils/validation'
import { FormField } from '@/components/shared/FormField'
import { PhoneInput } from './PhoneInput'
import { EMPLOYEE_ROLES as ROLES, GENDERS, formatRoleLabel } from '@/lib/utils/constants'
import { formatDateDisplay } from '@/lib/utils/dateFormatter'
import type { Employee, UpdateEmployeeRequest } from '@/types/employee'

type EditFormData = z.infer<typeof updateEmployeeSchema>

interface EmployeeEditFormProps {
  employee: Employee
  onSubmit: (data: UpdateEmployeeRequest) => void
  isLoading: boolean
  readOnly?: boolean
}

export function EmployeeEditForm({
  employee,
  onSubmit,
  isLoading,
  readOnly = false,
}: EmployeeEditFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      last_name: employee.last_name,
      gender: (GENDERS as readonly string[]).includes(employee.gender ?? '')
        ? employee.gender
        : 'Misha',
      phone: employee.phone,
      address: employee.address,
      position: employee.position,
      department: employee.department,
      role: employee.role as (typeof ROLES)[number],
      active: employee.active,
      jmbg: employee.jmbg,
    },
  })

  const role = watch('role')
  const active = watch('active')
  const phone = watch('phone') ?? ''
  const gender = watch('gender')

  const handleEditSubmit = (data: EditFormData) => {
    onSubmit({ ...data, jmbg: data.jmbg || undefined })
  }

  return (
    <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
      {readOnly && (
        <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
          View only — administrator profiles cannot be edited.
        </p>
      )}

      <FormField label="First Name" id="first_name">
        <Input id="first_name" defaultValue={employee.first_name} disabled />
      </FormField>

      <FormField
        label="Last Name"
        id="last_name"
        error={!readOnly ? errors.last_name?.message : undefined}
      >
        <Input id="last_name" {...register('last_name')} maxLength={20} disabled={readOnly} />
      </FormField>

      <FormField label="Date of Birth" id="date_of_birth">
        <Input
          id="date_of_birth"
          type="text"
          defaultValue={formatDateDisplay(employee.date_of_birth)}
          disabled
        />
      </FormField>

      <FormField label="Gender" id="gender">
        <Select
          value={gender ?? ''}
          onValueChange={(val) => setValue('gender', val || undefined)}
          disabled={readOnly}
        >
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

      <FormField label="Email" id="email">
        <Input id="email" type="email" defaultValue={employee.email} disabled />
      </FormField>

      <FormField label="Username" id="username">
        <Input id="username" defaultValue={employee.username} disabled />
      </FormField>

      <FormField label="Phone" error={!readOnly ? errors.phone?.message : undefined}>
        <PhoneInput value={phone} onChange={(val) => setValue('phone', val)} disabled={readOnly} />
      </FormField>

      <FormField label="Address" id="address">
        <Input id="address" {...register('address')} disabled={readOnly} />
      </FormField>

      <FormField label="Position" id="position">
        <Input id="position" {...register('position')} disabled={readOnly} />
      </FormField>

      <FormField label="Department" id="department">
        <Input id="department" {...register('department')} disabled={readOnly} />
      </FormField>

      <FormField label="JMBG" id="jmbg" error={!readOnly ? errors.jmbg?.message : undefined}>
        <Input
          id="jmbg"
          {...register('jmbg')}
          placeholder="13-digit JMBG"
          maxLength={13}
          inputMode="numeric"
          disabled={readOnly}
        />
      </FormField>

      <FormField label="Status" id="status">
        <Select
          value={active ? 'active' : 'inactive'}
          onValueChange={(val) => setValue('active', val === 'active')}
          disabled={readOnly}
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

      <FormField label="Role" id="role">
        <Select
          value={role}
          onValueChange={(val) => setValue('role', val as (typeof ROLES)[number])}
          disabled={readOnly}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role">
              {role ? formatRoleLabel(role) : null}
            </SelectValue>
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

      {!readOnly && (
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      )}
    </form>
  )
}
