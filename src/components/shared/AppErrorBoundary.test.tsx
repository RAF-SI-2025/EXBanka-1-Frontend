import { render, screen, fireEvent } from '@testing-library/react'
import { AppErrorBoundary } from './AppErrorBoundary'
import { notifyError } from '@/lib/errors/notify'

jest.mock('@/lib/errors/notify', () => ({ notifyError: jest.fn() }))

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom')
  return <div>safe child</div>
}

describe('AppErrorBoundary', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders children when there is no error', () => {
    render(
      <AppErrorBoundary>
        <Bomb shouldThrow={false} />
      </AppErrorBoundary>
    )
    expect(screen.getByText('safe child')).toBeInTheDocument()
  })

  it('renders the fallback and notifies when a child throws', () => {
    render(
      <AppErrorBoundary>
        <Bomb shouldThrow={true} />
      </AppErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()
    expect(notifyError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('resets when the user clicks "Try again"', () => {
    const { rerender } = render(
      <AppErrorBoundary>
        <Bomb shouldThrow={true} />
      </AppErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Swap the child to a non-throwing one BEFORE resetting, otherwise the
    // boundary will catch the same throw again on the next render.
    rerender(
      <AppErrorBoundary>
        <Bomb shouldThrow={false} />
      </AppErrorBoundary>
    )
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('safe child')).toBeInTheDocument()
  })
})
