import { render, screen } from '@testing-library/react'
import { LoadingState } from '@/views/shared/LoadingState'
import { ErrorState } from '@/views/shared/ErrorState'
import { EmptyState } from '@/views/shared/EmptyState'

describe('LoadingState', () => {
  it('renders default label and pulse animation', () => {
    render(<LoadingState />)
    const el = screen.getByTestId('view-loading')
    expect(el).toHaveTextContent('Loading…')
    expect(el).toHaveClass('animate-pulse')
  })

  it('respects a custom label', () => {
    render(<LoadingState label="Fetching rates" />)
    expect(screen.getByText('Fetching rates')).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('renders default destructive message', () => {
    render(<ErrorState />)
    const el = screen.getByTestId('view-error')
    expect(el).toHaveTextContent('Something went wrong.')
    expect(el).toHaveClass('text-destructive')
  })

  it('respects a custom message', () => {
    render(<ErrorState message="Could not load fees." />)
    expect(screen.getByText('Could not load fees.')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders default title and hint+action slots when provided', () => {
    render(
      <EmptyState
        title="No fees yet"
        hint="Create your first fee to get started."
        action={<button>New fee</button>}
      />
    )
    expect(screen.getByText('No fees yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first fee to get started.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New fee' })).toBeInTheDocument()
  })

  it('falls back to a generic title and omits optional slots', () => {
    render(<EmptyState />)
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
