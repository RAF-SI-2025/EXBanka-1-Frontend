import {
  passwordSchema,
  emailSchema,
  loginSchema,
  createLoanRequestSchema,
  phoneSchema,
  dateOfBirthStringSchema,
  dateOfBirthTimestampSchema,
  createEmployeeSchema,
  createClientSchema,
  authorizedPersonSchema,
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

describe('phoneSchema', () => {
  it('accepts a phone starting with +', () => {
    expect(phoneSchema.safeParse('+381601234567').success).toBe(true)
  })

  it('accepts a phone without +', () => {
    expect(phoneSchema.safeParse('0601234567').success).toBe(true)
  })

  it('rejects a phone with a dash', () => {
    expect(phoneSchema.safeParse('+38160-1234567').success).toBe(false)
  })

  it('rejects a phone with letters', () => {
    expect(phoneSchema.safeParse('abc123').success).toBe(false)
  })

  it('rejects a + that is not at the start', () => {
    expect(phoneSchema.safeParse('123+456').success).toBe(false)
  })

  it('rejects double + at start', () => {
    expect(phoneSchema.safeParse('++3811234').success).toBe(false)
  })

  it('rejects a phone longer than 15 characters', () => {
    expect(phoneSchema.safeParse('+1234567890123456').success).toBe(false)
  })

  it('rejects an empty string at the schema level (use .or(z.literal("")) for optional fields)', () => {
    expect(phoneSchema.safeParse('').success).toBe(false)
  })

  it('rejects a string with spaces', () => {
    expect(phoneSchema.safeParse('+381 60 1234567').success).toBe(false)
  })
})

const yearsAgo = (years: number, monthOffset = 0, dayOffset = 0): string => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  d.setMonth(d.getMonth() + monthOffset)
  d.setDate(d.getDate() + dayOffset)
  return d.toISOString().slice(0, 10)
}

describe('dateOfBirthStringSchema', () => {
  it('accepts a DoB exactly 16 years ago', () => {
    expect(dateOfBirthStringSchema.safeParse(yearsAgo(16)).success).toBe(true)
  })

  it('accepts a DoB well in the past (1990-01-01)', () => {
    expect(dateOfBirthStringSchema.safeParse('1990-01-01').success).toBe(true)
  })

  it('rejects an empty string', () => {
    expect(dateOfBirthStringSchema.safeParse('').success).toBe(false)
  })

  it('rejects a future date', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowIso = tomorrow.toISOString().slice(0, 10)
    const result = dateOfBirthStringSchema.safeParse(tomorrowIso)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/future/i)
  })

  it('rejects a DoB just under 16 years (15y 11m)', () => {
    const result = dateOfBirthStringSchema.safeParse(yearsAgo(15, -1))
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/16/)
  })

  it('rejects an invalid date string', () => {
    expect(dateOfBirthStringSchema.safeParse('not-a-date').success).toBe(false)
  })
})

const unixSecondsYearsAgo = (years: number, monthOffset = 0): number => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  d.setMonth(d.getMonth() + monthOffset)
  return Math.floor(d.getTime() / 1000)
}

describe('dateOfBirthTimestampSchema', () => {
  it('accepts a timestamp 16 years ago', () => {
    expect(dateOfBirthTimestampSchema.safeParse(unixSecondsYearsAgo(16)).success).toBe(true)
  })

  it('rejects a future timestamp', () => {
    const futureTs = Math.floor(Date.now() / 1000) + 86_400
    expect(dateOfBirthTimestampSchema.safeParse(futureTs).success).toBe(false)
  })

  it('rejects a timestamp under 16 years ago', () => {
    expect(dateOfBirthTimestampSchema.safeParse(unixSecondsYearsAgo(15, -1)).success).toBe(false)
  })
})

describe('createEmployeeSchema (DoB + phone)', () => {
  const validBase = {
    first_name: 'Ana',
    last_name: 'Petrovic',
    date_of_birth: unixSecondsYearsAgo(30),
    email: 'ana@example.com',
    username: 'apetrovic',
    role: 'EmployeeBasic' as const,
  }

  it('accepts a valid employee with phone "+381601234567"', () => {
    expect(createEmployeeSchema.safeParse({ ...validBase, phone: '+381601234567' }).success).toBe(
      true
    )
  })

  it('accepts an employee with no phone (optional)', () => {
    expect(createEmployeeSchema.safeParse(validBase).success).toBe(true)
  })

  it('accepts an employee with empty-string phone (optional or "")', () => {
    expect(createEmployeeSchema.safeParse({ ...validBase, phone: '' }).success).toBe(true)
  })

  it('rejects an employee whose phone contains a letter', () => {
    expect(createEmployeeSchema.safeParse({ ...validBase, phone: '+381abc' }).success).toBe(false)
  })

  it('rejects an employee under 16', () => {
    expect(
      createEmployeeSchema.safeParse({
        ...validBase,
        date_of_birth: unixSecondsYearsAgo(10),
      }).success
    ).toBe(false)
  })

  it('rejects an employee with future date of birth', () => {
    const future = Math.floor(Date.now() / 1000) + 86_400
    expect(createEmployeeSchema.safeParse({ ...validBase, date_of_birth: future }).success).toBe(
      false
    )
  })
})

describe('createClientSchema (DoB + phone)', () => {
  const validBase = {
    first_name: 'Marko',
    last_name: 'Jovanovic',
    date_of_birth: yearsAgo(30),
    email: 'marko@example.com',
    jmbg: '0506960710123',
  }

  it('accepts a valid client', () => {
    expect(createClientSchema.safeParse(validBase).success).toBe(true)
  })

  it('rejects a client with phone "123+45"', () => {
    expect(createClientSchema.safeParse({ ...validBase, phone: '123+45' }).success).toBe(false)
  })

  it('rejects a client under 16', () => {
    expect(
      createClientSchema.safeParse({ ...validBase, date_of_birth: yearsAgo(10) }).success
    ).toBe(false)
  })

  it('rejects a client with a future DoB', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(
      createClientSchema.safeParse({
        ...validBase,
        date_of_birth: tomorrow.toISOString().slice(0, 10),
      }).success
    ).toBe(false)
  })
})

describe('authorizedPersonSchema (DoB + phone)', () => {
  const validBase = {
    first_name: 'Ana',
    last_name: 'Jovanovic',
    date_of_birth: yearsAgo(25),
    email: 'ana@example.com',
  }

  it('accepts a valid authorized person', () => {
    expect(authorizedPersonSchema.safeParse(validBase).success).toBe(true)
  })

  it('rejects an authorized person with phone containing a hyphen', () => {
    expect(authorizedPersonSchema.safeParse({ ...validBase, phone: '+381-60-1234' }).success).toBe(
      false
    )
  })

  it('rejects an authorized person under 16', () => {
    expect(
      authorizedPersonSchema.safeParse({ ...validBase, date_of_birth: yearsAgo(10) }).success
    ).toBe(false)
  })
})
