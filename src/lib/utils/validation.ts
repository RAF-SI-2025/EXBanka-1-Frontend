import { z } from 'zod'
import { EMPLOYEE_ROLES } from '@/lib/utils/constants'

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

// --- Banking Schemas ---

const LOAN_TYPES_ENUM = ['CASH', 'MORTGAGE', 'AUTO', 'REFINANCING', 'STUDENT'] as const
const ACCOUNT_KIND_ENUM = ['CHECKING', 'SAVINGS', 'FOREIGN_CURRENCY', 'BUSINESS'] as const
const ACCOUNT_TYPE_ENUM = ['CURRENT', 'TERM'] as const
const ACCOUNT_CATEGORY_ENUM = ['PERSONAL', 'COMPANY'] as const

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  registration_number: z.string().regex(/^\d{8}$/, 'Must be exactly 8 digits'),
  tax_number: z.string().regex(/^\d{9}$/, 'Must be exactly 9 digits'),
  activity_code: z.string().regex(/^\d{2}\.\d{1,2}$/, 'Format: XX.XX'),
  address: z.string().min(1, 'Address is required'),
})

export const createAccountSchema = z.object({
  owner_id: z.number().min(1, 'Owner is required'),
  account_kind: z.enum(ACCOUNT_KIND_ENUM),
  account_type: z.enum(ACCOUNT_TYPE_ENUM),
  account_category: z.enum(ACCOUNT_CATEGORY_ENUM).optional(),
  currency_code: z.string().min(1, 'Currency is required'),
  initial_balance: z.number().min(0, 'Balance cannot be negative').optional(),
  create_card: z.boolean().optional(),
  daily_limit: z.number().min(0).optional(),
  monthly_limit: z.number().min(0).optional(),
})

export const createTransferSchema = z
  .object({
    from_account_number: z.string().min(1, 'From account is required'),
    to_account_number: z.string().min(1, 'To account is required'),
    amount: z.number().positive('Amount must be greater than 0'),
  })
  .refine((data) => data.from_account_number !== data.to_account_number, {
    message: 'Source and destination must be different',
    path: ['to_account_number'],
  })

export const createPaymentSchema = z.object({
  from_account_number: z.string().min(1, 'From account is required'),
  to_account_number: z.string().min(1, 'To account is required'),
  recipient_name: z.string().min(1, 'Receiver name is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  payment_code: z.string().min(1, 'Payment code is required'),
  reference_number: z.string().optional(),
  payment_purpose: z.string().optional(),
})

export const createInternalTransferSchema = z
  .object({
    from_account_number: z.string().min(1, 'From account is required'),
    to_account_number: z.string().min(1, 'To account is required'),
    amount: z.number().positive('Amount must be greater than 0'),
    payment_purpose: z.string().optional(),
  })
  .refine((data) => data.from_account_number !== data.to_account_number, {
    message: 'Source and destination must be different',
    path: ['to_account_number'],
  })

export const createLoanRequestSchema = z.object({
  loan_type: z.enum(LOAN_TYPES_ENUM, { message: 'Izaberite vrstu kredita' }),
  interest_type: z.enum(['FIXED', 'VARIABLE'] as const, {
    message: 'Izaberite tip kamatne stope',
  }),
  account_number: z.string().min(1, 'Izaberite račun'),
  amount: z.number({ error: 'Unesite iznos' }).positive('Iznos mora biti pozitivan'),
  currency_code: z.string().min(1, 'Izaberite valutu'),
  purpose: z.string().optional(),
  monthly_salary: z.number().positive('Plata mora biti pozitivna').optional(),
  employment_status: z.string().optional(),
  employment_period: z.number().int().min(0).optional(),
  period: z.number({ error: 'Izaberite period otplate' }).int().positive(),
  phone: z.string().max(15).optional().or(z.literal('')),
})

export const paymentRecipientSchema = z.object({
  recipient_name: z.string().min(1, 'Name is required'),
  account_number: z.string().min(1, 'Account number is required'),
})

export const updateAccountLimitsSchema = z.object({
  daily_limit: z.number().min(0, 'Daily limit cannot be negative').optional(),
  monthly_limit: z.number().min(0, 'Monthly limit cannot be negative').optional(),
})

export const updateAccountNameSchema = z.object({
  new_name: z.string().min(1, 'Account name is required'),
})

export const updateClientSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
})

// --- End Banking Schemas ---

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

export const createClientSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(20, 'First name must be at most 20 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be at most 20 characters'),
  date_of_birth: z.number({ error: 'Date of birth is required' }),
  email: emailSchema,
  gender: z.string().optional(),
  phone: z.string().max(15, 'Phone number must be at most 15 digits').optional(),
  address: z.string().optional(),
  jmbg: z
    .string()
    .regex(/^\d{13}$/, 'JMBG must be exactly 13 digits')
    .optional()
    .or(z.literal('')),
})
