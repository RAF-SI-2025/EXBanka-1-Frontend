import { AxiosError } from 'axios'

export interface AppError {
  title: string
  message: string
  code?: string
  status?: number
}

const TITLE_BY_STATUS: Record<number, string> = {
  400: 'Invalid request',
  401: 'Not authenticated',
  403: 'Not allowed',
  404: 'Not found',
  409: 'Conflict',
  422: 'Validation failed',
}

function titleByStatus(s: number): string {
  if (TITLE_BY_STATUS[s]) return TITLE_BY_STATUS[s]
  if (s >= 500) return 'Server error'
  return 'Request failed'
}

function defaultByStatus(s: number): string {
  if (s >= 500) return 'The server reported an error. Please try again in a moment.'
  if (s === 401) return 'Your session expired. Please log in again.'
  if (s === 403) return 'You do not have permission to do that.'
  if (s === 404) return 'We could not find what you were looking for.'
  return 'Request could not be completed.'
}

function isAxiosError(err: unknown): err is AxiosError {
  return Boolean(err) && typeof err === 'object' && 'isAxiosError' in (err as object)
}

export function parseApiError(err: unknown): AppError {
  if (isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') {
      return {
        title: 'Request timed out',
        message: 'The server took too long to respond. Please try again.',
      }
    }
    if (err.response) {
      const status = err.response.status
      const data = err.response.data as { error?: unknown; code?: unknown } | undefined
      const message = typeof data?.error === 'string' ? data.error : defaultByStatus(status)
      return {
        title: titleByStatus(status),
        message,
        ...(typeof data?.code === 'string' ? { code: data.code } : {}),
        status,
      }
    }
    return {
      title: 'Network error',
      message: 'Could not reach the server. Check your connection.',
    }
  }
  if (err instanceof Error) {
    return { title: 'Something went wrong', message: err.message }
  }
  if (typeof err === 'string') {
    return { title: 'Something went wrong', message: err }
  }
  return { title: 'Something went wrong', message: 'Unexpected error occurred.' }
}
