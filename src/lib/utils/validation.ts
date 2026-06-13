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

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]+$/, 'Phone must contain only digits, optionally starting with "+"')
  .max(15, 'Phone number must be at most 15 characters')

const isAtLeast16YearsAgo = (date: Date): boolean => {
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 16)
  cutoff.setHours(23, 59, 59, 999)
  return date.getTime() <= cutoff.getTime()
}

export const dateOfBirthStringSchema = z
  .string()
  .min(1, 'Date of birth is required')
  .refine((val) => !Number.isNaN(new Date(val).getTime()), {
    message: 'Date of birth is invalid',
  })
  .refine((val) => new Date(val).getTime() <= Date.now(), {
    message: 'Date of birth cannot be in the future',
  })
  .refine((val) => isAtLeast16YearsAgo(new Date(val)), {
    message: 'Must be at least 16 years old',
  })

export const dateOfBirthTimestampSchema = z
  .number()
  .refine((ts) => ts * 1000 <= Date.now(), {
    message: 'Date of birth cannot be in the future',
  })
  .refine((ts) => isAtLeast16YearsAgo(new Date(ts * 1000)), {
    message: 'Must be at least 16 years old',
  })

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
  date_of_birth: dateOfBirthTimestampSchema,
  gender: z.string().optional(),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
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

const LOAN_TYPES_ENUM = ['CASH', 'HOUSING', 'AUTO', 'REFINANCING', 'STUDENT'] as const
const ACCOUNT_KIND_ENUM = ['current', 'foreign'] as const
const ACCOUNT_CATEGORY_ENUM = ['personal', 'business'] as const

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
  account_type: z.string().min(1, 'Account type is required'),
  account_category: z.enum(ACCOUNT_CATEGORY_ENUM).optional(),
  currency_code: z.string().min(1, 'Currency is required'),
  initial_balance: z.number().min(0, 'Balance cannot be negative').optional(),
  create_card: z.boolean().optional(),
  card_brand: z.enum(['visa', 'mastercard', 'dinacard'] as const).optional(),
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
  loan_type: z.enum(LOAN_TYPES_ENUM, { message: 'Please select a loan type' }),
  interest_type: z.enum(['FIXED', 'VARIABLE'] as const, {
    message: 'Please select an interest rate type',
  }),
  account_number: z.string().min(1, 'Please select an account'),
  amount: z
    .number({ error: 'Please enter an amount' })
    .positive('Amount must be positive')
    .max(10_000_000, 'Amount cannot exceed 10,000,000'),
  currency_code: z.string().min(1, 'Please select a currency'),
  purpose: z.string().optional(),
  monthly_salary: z.number().positive('Salary must be positive').optional(),
  employment_status: z.string().optional(),
  employment_period: z.number().int().min(0).optional(),
  repayment_period: z.number({ error: 'Please select a repayment period' }).int().positive(),
  phone: phoneSchema.optional().or(z.literal('')),
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
  phone: phoneSchema.optional().or(z.literal('')),
  address: z.string().optional(),
  gender: z.string().optional(),
})

export const authorizedPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: dateOfBirthStringSchema,
  gender: z.string().optional(),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  address: z.string().optional(),
})

// --- End Banking Schemas ---

export const updateEmployeeSchema = z.object({
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be at most 20 characters')
    .optional(),
  gender: z.string().optional(),
  phone: phoneSchema.optional().or(z.literal('')),
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
  date_of_birth: dateOfBirthStringSchema,
  email: emailSchema,
  gender: z.string().optional(),
  phone: phoneSchema.optional().or(z.literal('')),
  address: z.string().optional(),
  jmbg: z.string().regex(/^\d{13}$/, 'JMBG must have exactly 13 digits'),
})
