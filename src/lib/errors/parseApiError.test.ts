import { AxiosError } from 'axios'
import { parseApiError } from './parseApiError'

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError('req failed')
  err.response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as AxiosError['config'],
  } as AxiosError['response']
  return err
}

describe('parseApiError', () => {
  it('uses backend error string + code for 4xx with JSON body', () => {
    const result = parseApiError(
      makeAxiosError(400, { error: 'Insufficient funds', code: 'FUNDS_INSUFFICIENT' })
    )
    expect(result).toEqual({
      title: 'Invalid request',
      message: 'Insufficient funds',
      code: 'FUNDS_INSUFFICIENT',
      status: 400,
    })
  })

  it('falls back to status-based default when body has no error field', () => {
    const result = parseApiError(makeAxiosError(500, {}))
    expect(result.title).toBe('Server error')
    expect(result.message).toMatch(/server/i)
    expect(result.status).toBe(500)
  })

  it('classifies a network error (no response) as network', () => {
    const err = new AxiosError('Network Error')
    expect(parseApiError(err)).toEqual({
      title: 'Network error',
      message: expect.stringMatching(/connection|reach the server/i),
    })
  })

  it('classifies ECONNABORTED as timeout', () => {
    const err = new AxiosError('timeout')
    err.code = 'ECONNABORTED'
    expect(parseApiError(err).title).toBe('Request timed out')
  })

  it('handles a plain Error', () => {
    expect(parseApiError(new Error('boom'))).toEqual({
      title: 'Something went wrong',
      message: 'boom',
    })
  })

  it('handles a string', () => {
    expect(parseApiError('manual error')).toEqual({
      title: 'Something went wrong',
      message: 'manual error',
    })
  })

  it('handles unknown garbage', () => {
    expect(parseApiError({ wat: true })).toEqual({
      title: 'Something went wrong',
      message: 'Unexpected error occurred.',
    })
  })

  it('maps 401 to "Not authenticated"', () => {
    expect(parseApiError(makeAxiosError(401, {})).title).toBe('Not authenticated')
  })

  it('maps 403 to "Not allowed"', () => {
    expect(parseApiError(makeAxiosError(403, {})).title).toBe('Not allowed')
  })

  it('maps 404 to "Not found"', () => {
    expect(parseApiError(makeAxiosError(404, {})).title).toBe('Not found')
  })
})
