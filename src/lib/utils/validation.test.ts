import {
  passwordSchema,
  emailSchema,
  loginSchema,
  createLoanRequestSchema,
} from '@/lib/utils/validation'

const validLoanData = {
  loan_type: 'CASH' as const,
  interest_type: 'FIXED' as const,
  account_number: '265-0000000000001-00',
  amount: 100000,
  currency_code: 'RSD',
  repayment_period: 24,
}

describe('createLoanRequestSchema', () => {
  it('accepts repayment_period as the period field', () => {
    expect(createLoanRequestSchema.safeParse(validLoanData).success).toBe(true)
  })

  it('rejects when repayment_period is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { repayment_period: _period, ...without } = validLoanData
    expect(createLoanRequestSchema.safeParse(without).success).toBe(false)
  })

  it('rejects loan amounts above 10,000,000', () => {
    const result = createLoanRequestSchema.safeParse({
      loan_type: 'CASH',
      interest_type: 'FIXED',
      account_number: '265-0000000042-10',
      amount: 10_000_001,
      currency_code: 'RSD',
      repayment_period: 12,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/10,000,000/i)
  })

  it('accepts loan amounts at the boundary', () => {
    const result = createLoanRequestSchema.safeParse({
      loan_type: 'CASH',
      interest_type: 'FIXED',
      account_number: '265-0000000042-10',
      amount: 10_000_000,
      currency_code: 'RSD',
      repayment_period: 12,
    })
    expect(result.success).toBe(true)
  })
})

describe('passwordSchema', () => {
  it('rejects password shorter than 8 chars', () => {
    const result = passwordSchema.safeParse('Ab1')
    expect(result.success).toBe(false)
  })

  it('rejects password longer than 32 chars', () => {
    const result = passwordSchema.safeParse('Aa11' + 'x'.repeat(30))
    expect(result.success).toBe(false)
  })

  it('rejects password without 2 numbers', () => {
    const result = passwordSchema.safeParse('Abcdefgh1')
    expect(result.success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    const result = passwordSchema.safeParse('abcdefg12')
    expect(result.success).toBe(false)
  })

  it('rejects password without lowercase', () => {
    const result = passwordSchema.safeParse('ABCDEFG12')
    expect(result.success).toBe(false)
  })

  it('accepts valid password', () => {
    const result = passwordSchema.safeParse('ValidPass12')
    expect(result.success).toBe(true)
  })
})

describe('emailSchema', () => {
  it('rejects invalid email', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
  })

  it('accepts valid email', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true)
  })
})

describe('loginSchema', () => {
  it('requires email and password', () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Pass1234' })
    expect(result.success).toBe(true)
  })
})
