import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { Sidebar } from '@/components/layout/Sidebar'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

describe('Sidebar', () => {
  it('shows Employees link when role is EmployeeAdmin', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeAdmin' }),
        }),
      },
    })
    expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute('href', '/employees')
  })

  it('hides Employees link for non-admin employee roles', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeBasic' }),
        }),
      },
    })
    expect(screen.queryByRole('link', { name: /employees/i })).not.toBeInTheDocument()
  })

  it('shows Actuaries and Order Approval for EmployeeSupervisor', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeSupervisor' }),
        }),
      },
    })
    expect(screen.getByRole('link', { name: /actuaries/i })).toHaveAttribute(
      'href',
      '/admin/actuaries'
    )
    expect(screen.getByRole('link', { name: /order approval/i })).toHaveAttribute(
      'href',
      '/admin/orders'
    )
  })

  it('hides Actuaries and Order Approval for EmployeeAgent', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeAgent' }),
        }),
      },
    })
    expect(screen.queryByRole('link', { name: /actuaries/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /order approval/i })).not.toBeInTheDocument()
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
