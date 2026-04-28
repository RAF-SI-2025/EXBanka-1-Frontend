import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorFallback } from './ErrorFallback'

describe('ErrorFallback', () => {
  it('renders the default message when none is provided', () => {
    render(<ErrorFallback />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument()
  })

  it('renders a custom message', () => {
    render(<ErrorFallback message="boom" />)
    expect(screen.getByText('boom')).toBeInTheDocument()
  })

  it('omits the retry button when onRetry is not provided', () => {
    render(<ErrorFallback />)
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('fires onRetry when the button is clicked', () => {
    const onRetry = jest.fn()
    render(<ErrorFallback onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
