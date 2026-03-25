import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(32, 'Password must be at most 32 characters')
  .refine((val) => (val.match(/\d/g) || []).length >= 2, {
    message: 'Password must contain at least 2 numbers',
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least 1 uppercase letter',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least 1 lowercase letter',
  })

export const emailSchema = z.string().email('Invalid email address')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const passwordResetSchema = z
  .object({
    token: z.string().min(1),
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const activationSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

const EMPLOYEE_ROLES = [
  'EmployeeBasic',
  'EmployeeAgent',
  'EmployeeSupervisor',
  'EmployeeAdmin',
] as const

export const createEmployeeSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(20, 'First name must be at most 20 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be at most 20 characters'),
  date_of_birth: z.number(),
  gender: z.string().optional(),
  email: emailSchema,
  phone: z.string().max(15, 'Phone number must be at most 15 digits').optional(),
  address: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  position: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(EMPLOYEE_ROLES, { message: 'Role is required' }),
  active: z.boolean().optional().default(true),
  jmbg: z
    .string()
    .regex(/^\d{13}$/, 'JMBG must be exactly 13 digits')
    .optional(),
})

export const updateEmployeeSchema = z.object({
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be at most 20 characters')
    .optional(),
  gender: z.string().optional(),
  phone: z.string().max(15, 'Phone number must be at most 15 digits').optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(EMPLOYEE_ROLES).optional(),
  active: z.boolean().optional(),
  jmbg: z
    .string()
    .regex(/^\d{13}$/, 'JMBG must be exactly 13 digits')
    .optional()
    .or(z.literal('')),
})
