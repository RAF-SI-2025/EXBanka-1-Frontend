import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthFormCard } from '@/components/auth/AuthFormCard'

describe('AuthFormCard', () => {
  it('renders title and children in normal mode', () => {
    render(
      <MemoryRouter>
        <AuthFormCard title="Log In">
          <input placeholder="email" />
        </AuthFormCard>
      </MemoryRouter>
    )
    expect(screen.getByText('Log In')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument()
  })

  it('renders success content and hides children when isSuccess is true', () => {
    render(
      <MemoryRouter>
        <AuthFormCard title="Log In" isSuccess successContent={<p>All done!</p>}>
          <input placeholder="email" />
        </AuthFormCard>
      </MemoryRouter>
    )
    expect(screen.getByText('All done!')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('email')).not.toBeInTheDocument()
  })

  it('does not render title when isSuccess is true', () => {
    render(
      <MemoryRouter>
        <AuthFormCard title="Log In" isSuccess successContent={<p>Done</p>}>
          <input />
        </AuthFormCard>
      </MemoryRouter>
    )
    expect(screen.queryByText('Log In')).not.toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(
      <MemoryRouter>
        <AuthFormCard title="Log In" error="Invalid credentials">
          <input />
        </AuthFormCard>
      </MemoryRouter>
    )
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })
})
