import { AxiosError, AxiosHeaders } from 'axios'
import { isDuplicateEmailError } from './isDuplicateEmailError'

const makeAxiosError = (status: number, data: unknown): AxiosError => {
  const err = new AxiosError('Request failed')
  err.response = {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  }
  return err
}

describe('isDuplicateEmailError', () => {
  it('returns true for HTTP 409', () => {
    expect(isDuplicateEmailError(makeAxiosError(409, { error: 'conflict' }))).toBe(true)
  })

  it('returns true for HTTP 400 with message "email already exists"', () => {
    expect(isDuplicateEmailError(makeAxiosError(400, { error: 'email already exists' }))).toBe(true)
  })

  it('returns true for HTTP 400 with case-insensitive "Email Is Taken"', () => {
    expect(isDuplicateEmailError(makeAxiosError(400, { error: 'Email Is Taken' }))).toBe(true)
  })

  it('returns true for HTTP 400 with "email must be unique"', () => {
    expect(isDuplicateEmailError(makeAxiosError(400, { error: 'email must be unique' }))).toBe(true)
  })

  it('returns false for HTTP 400 with generic validation error', () => {
    expect(isDuplicateEmailError(makeAxiosError(400, { error: 'validation error' }))).toBe(false)
  })

  it('returns false for HTTP 500', () => {
    expect(isDuplicateEmailError(makeAxiosError(500, { error: 'internal' }))).toBe(false)
  })

  it('returns false for a plain Error', () => {
    expect(isDuplicateEmailError(new Error('boom'))).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isDuplicateEmailError('something happened')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isDuplicateEmailError(null)).toBe(false)
  })
})
