import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { Sidebar } from '@/components/layout/Sidebar'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

describe('Sidebar', () => {
  it('shows Employees link when user has employees.read permission', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ permissions: ['employees.read'] }),
        }),
      },
    })
    expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute('href', '/employees')
  })

  it('shows Employees link regardless of role when employees.read permission is present', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeBasic', permissions: ['employees.read'] }),
        }),
      },
    })
    expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute('href', '/employees')
  })

  it('hides Employees link when user lacks employees.read permission', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeBasic', permissions: [] }),
        }),
      },
    })
    expect(screen.queryByRole('link', { name: /employees/i })).not.toBeInTheDocument()
  })

  it('shows logout button', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  it('displays user email', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('renders theme toggle button with aria-label "Switch to dark mode" in light mode', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })

  it('renders theme toggle button with aria-label "Switch to light mode" in dark mode', () => {
    // Must be set BEFORE render — ThemeProvider reads localStorage only on mount
    localStorage.setItem('theme', 'dark')
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
  })

  it('clicking the theme toggle button toggles the .dark class on <html>', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i })
    await user.click(toggleBtn)
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })
})
