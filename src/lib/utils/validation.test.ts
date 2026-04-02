import { passwordSchema, emailSchema, loginSchema } from '@/lib/utils/validation'

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
