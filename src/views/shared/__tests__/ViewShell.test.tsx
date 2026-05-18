import { render, screen } from '@testing-library/react'
import { ViewShell } from '@/views/shared/ViewShell'

describe('ViewShell', () => {
  it('renders children inside the animated wrapper', () => {
    render(
      <ViewShell>
        <p>content</p>
      </ViewShell>
    )
    const shell = screen.getByTestId('view-shell')
    expect(shell).toHaveClass('animate-in')
    expect(shell).toHaveClass('fade-in')
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('renders a header with title, subtitle, and actions', () => {
    render(
      <ViewShell
        title="Page title"
        subtitle="A short description"
        actions={<button>Primary</button>}
      >
        <p>body</p>
      </ViewShell>
    )
    expect(screen.getByRole('heading', { name: 'Page title', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('A short description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument()
  })

  it('omits the header row entirely when no title/actions are given', () => {
    render(
      <ViewShell>
        <p>only body</p>
      </ViewShell>
    )
    // There should be no h1 at all.
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('appends a custom className to the shell', () => {
    render(
      <ViewShell className="custom-shell">
        <p>x</p>
      </ViewShell>
    )
    expect(screen.getByTestId('view-shell')).toHaveClass('custom-shell')
  })
})
