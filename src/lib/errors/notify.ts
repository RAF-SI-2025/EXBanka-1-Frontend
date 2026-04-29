import { toast } from 'sonner'
import { parseApiError } from './parseApiError'

export function notifyError(err: unknown): void {
  const { title, message } = parseApiError(err)
  toast.error(title, { description: message })
}

export function notifySuccess(message: string): void {
  toast.success(message)
}
