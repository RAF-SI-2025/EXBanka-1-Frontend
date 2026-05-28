import { parseApiError } from './parseApiError'

const DUPLICATE_KEYWORDS = /exist|taken|duplicate|unique|alread/

export const isDuplicateEmailError = (err: unknown): boolean => {
  const parsed = parseApiError(err)
  if (parsed.status === 409) return true
  if (parsed.status !== 400) return false
  const msg = parsed.message.toLowerCase()
  return msg.includes('email') && DUPLICATE_KEYWORDS.test(msg)
}
