import { notifyError, notifySuccess } from './notify'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}))

beforeEach(() => jest.clearAllMocks())

describe('notifyError', () => {
  it('shows toast.error with title and parsed message', () => {
    notifyError(new Error('boom'))
    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong',
      expect.objectContaining({ description: 'boom' })
    )
  })

  it('does not throw when given undefined', () => {
    expect(() => notifyError(undefined)).not.toThrow()
    expect(toast.error).toHaveBeenCalled()
  })
})

describe('notifySuccess', () => {
  it('shows toast.success', () => {
    notifySuccess('Saved')
    expect(toast.success).toHaveBeenCalledWith('Saved')
  })
})
