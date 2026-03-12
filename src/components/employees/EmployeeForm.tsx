import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateEmployeeSchema } from '@/lib/utils/validation'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee'

const ROLES = ['EmployeeBasic', 'EmployeeAgent', 'EmployeeSupervisor', 'EmployeeAdmin'] as const
const GENDERS = ['Male', 'Female', 'Other', 'Misha'] as const

const COUNTRY_CODES = [
  { code: '+381', flag: '🇷🇸', iso: 'SRB' },
  { code: '+1', flag: '🇺🇸', iso: 'USA' },
  { code: '+44', flag: '🇬🇧', iso: 'GBR' },
  { code: '+49', flag: '🇩🇪', iso: 'DEU' },
  { code: '+33', flag: '🇫🇷', iso: 'FRA' },
  { code: '+39', flag: '🇮🇹', iso: 'ITA' },
  { code: '+43', flag: '🇦🇹', iso: 'AUT' },
  { code: '+385', flag: '🇭🇷', iso: 'HRV' },
  { code: '+387', flag: '🇧🇦', iso: 'BIH' },
  { code: '+382', flag: '🇲🇪', iso: 'MNE' },
  { code: '+389', flag: '🇲🇰', iso: 'MKD' },
  { code: '+36', flag: '🇭🇺', iso: 'HUN' },
  { code: '+48', flag: '🇵🇱', iso: 'POL' },
  { code: '+40', flag: '🇷🇴', iso: 'ROU' },
  { code: '+30', flag: '🇬🇷', iso: 'GRC' },
  { code: '+90', flag: '🇹🇷', iso: 'TUR' },
  { code: '+7', flag: '🇷🇺', iso: 'RUS' },
  { code: '+86', flag: '🇨🇳', iso: 'CHN' },
  { code: '+91', flag: '🇮🇳', iso: 'IND' },
  { code: '+55', flag: '🇧🇷', iso: 'BRA' },
  { code: '+52', flag: '🇲🇽', iso: 'MEX' },
  { code: '+61', flag: '🇦🇺', iso: 'AUS' },
  { code: '+81', flag: '🇯🇵', iso: 'JPN' },
  { code: '+82', flag: '🇰🇷', iso: 'KOR' },
  { code: '+27', flag: '🇿🇦', iso: 'ZAF' },
  { code: '+20', flag: '🇪🇬', iso: 'EGY' },
  { code: '+966', flag: '🇸🇦', iso: 'SAU' },
  { code: '+971', flag: '🇦🇪', iso: 'ARE' },
  { code: '+1', flag: '🇨🇦', iso: 'CAN' },
  { code: '+54', flag: '🇦🇷', iso: 'ARG' },
] as const

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => void
  isLoading: boolean
  employee?: Employee
  readOnly?: boolean
}

// Create form schema
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
  jmbg: z
    .string()
    .regex(/^\d{13}$/, 'JMBG must be exactly 13 digits')
    .optional()
    .or(z.literal('')),
})

type CreateFormData = z.infer<typeof createFormSchema>
type EditFormData = z.infer<typeof updateEmployeeSchema>

const todayISO = () => new Date().toISOString().split('T')[0]

const formatDateDisplay = (ts: number): string => {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function PhoneInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}) {
  const parsePhone = (full: string) => {
    for (const cc of COUNTRY_CODES) {
      if (full.startsWith(cc.code)) {
        return { countryCode: cc.code, number: full.slice(cc.code.length) }
      }
    }
    return { countryCode: '+381', number: full }
  }

  const parsed = parsePhone(value)
  const [countryCode, setCountryCode] = useState(parsed.countryCode)
  const [number, setNumber] = useState(parsed.number)

  if (disabled) {
    return <Input type="tel" value={value} disabled />
  }

  const handleCountryChange = (code: string | null) => {
    if (!code) return
    setCountryCode(code)
    onChange(code + number)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15)
    setNumber(digits)
    onChange(countryCode + digits)
  }

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0]

  return (
    <div className="flex gap-1">
      <Select value={countryCode} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[110px] shrink-0 text-xs">
          <SelectValue>
            <span className="flex items-center gap-1">
              <span>{selectedCountry.flag}</span>
              <span className="font-medium">{selectedCountry.iso}</span>
              <span className="text-muted-foreground">{selectedCountry.code}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {COUNTRY_CODES.map((c) => (
            <SelectItem key={`${c.iso}-${c.code}`} value={c.code}>
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span className="font-medium">{c.iso}</span>
                <span className="text-muted-foreground text-xs">{c.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        placeholder="Phone number"
        value={number}
        onChange={handleNumberChange}
        maxLength={15}
        inputMode="numeric"
      />
    </div>
  )
}

function EditForm({
  employee,
  onSubmit,
  isLoading,
  readOnly = false,
}: {
  employee: Employee
  onSubmit: (data: UpdateEmployeeRequest) => void
  isLoading: boolean
  readOnly?: boolean
}) {
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
      gender: employee.gender,
      phone: employee.phone,
      address: employee.address,
      position: employee.position,
      department: employee.department,
      role: employee.role as (typeof ROLES)[number],
      active: employee.active,
      jmbg: employee.jmbg ?? '',
    },
  })

  const role = watch('role')
  const active = watch('active')
  const phone = watch('phone') ?? ''
  const gender = watch('gender')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {readOnly && (
        <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
          View only — administrator profiles cannot be edited.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input id="first_name" defaultValue={employee.first_name} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input id="last_name" {...register('last_name')} maxLength={20} disabled={readOnly} />
        {!readOnly && errors.last_name && (
          <p className="text-sm text-destructive">{errors.last_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Input
          id="date_of_birth"
          type="text"
          defaultValue={formatDateDisplay(employee.date_of_birth)}
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue={employee.email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue={employee.username} disabled />
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <PhoneInput value={phone} onChange={(val) => setValue('phone', val)} disabled={readOnly} />
        {!readOnly && errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} disabled={readOnly} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input id="position" {...register('position')} disabled={readOnly} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register('department')} disabled={readOnly} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jmbg">JMBG</Label>
        <Input
          id="jmbg"
          {...register('jmbg')}
          placeholder="13-digit JMBG"
          maxLength={13}
          inputMode="numeric"
          disabled={readOnly}
        />
        {!readOnly && errors.jmbg && (
          <p className="text-sm text-destructive">{errors.jmbg.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(val) => setValue('role', val as (typeof ROLES)[number])}
          disabled={readOnly}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!readOnly && (
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      )}
    </form>
  )
}

function CreateForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: CreateEmployeeRequest) => void
  isLoading: boolean
}) {
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
    const payload = {
      ...data,
      date_of_birth: timestamp,
      jmbg: data.jmbg || undefined,
    } as CreateEmployeeRequest
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input id="first_name" {...register('first_name')} maxLength={20} />
        {errors.first_name && (
          <p className="text-sm text-destructive">{errors.first_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input id="last_name" {...register('last_name')} maxLength={20} />
        {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Input id="date_of_birth" type="date" max={todayISO()} {...register('date_of_birth')} />
        {errors.date_of_birth && (
          <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <PhoneInput value={phone} onChange={(val) => setValue('phone', val)} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} />
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input id="position" {...register('position')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register('department')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jmbg">JMBG</Label>
        <Input
          id="jmbg"
          {...register('jmbg')}
          placeholder="13-digit JMBG"
          maxLength={13}
          inputMode="numeric"
        />
        {errors.jmbg && <p className="text-sm text-destructive">{errors.jmbg.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
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
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}

export function EmployeeForm({ onSubmit, isLoading, employee, readOnly }: EmployeeFormProps) {
  if (employee) {
    return (
      <EditForm
        employee={employee}
        onSubmit={(data) => onSubmit(data)}
        isLoading={isLoading}
        readOnly={readOnly}
      />
    )
  }

  return <CreateForm onSubmit={(data) => onSubmit(data)} isLoading={isLoading} />
}
