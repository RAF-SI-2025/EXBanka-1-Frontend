import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { Sidebar } from '@/components/layout/Sidebar'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'
import { rootReducer } from '@/store'
import type { RootState } from '@/store'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { createQueryClient } from '@/lib/queryClient'

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

  it('shows Logs link when role is EmployeeAdmin', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeAdmin' }),
        }),
      },
    })
    expect(screen.getByRole('link', { name: /logs/i })).toHaveAttribute('href', '/admin/audit')
  })

  it('hides Logs link for non-admin employee roles', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeSupervisor' }),
        }),
      },
    })
    expect(screen.queryByRole('link', { name: /logs/i })).not.toBeInTheDocument()
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

  it('shows the consolidated Settings link for EmployeeAdmin', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeAdmin' }),
        }),
      },
    })
    expect(screen.getByRole('link', { name: /^settings$/i })).toHaveAttribute(
      'href',
      '/admin/settings'
    )
  })

  it('hides the Settings link for non-admin employees', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: {
        auth: createMockAuthState({
          user: createMockAuthUser({ role: 'EmployeeBasic' }),
        }),
      },
    })
    expect(screen.queryByRole('link', { name: /^settings$/i })).not.toBeInTheDocument()
  })

  it('exposes a Backend button that opens the backend selector', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await user.click(screen.getByRole('button', { name: /^backend$/i }))
    expect(await screen.findByText(/switch backend/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^backend$/i)).toBeInTheDocument()
  })

  it('clears auth and tokens when the backend host is changed mid-session', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem('access_token', 'at')
    sessionStorage.setItem('refresh_token', 'rt')
    const { store } = renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    await user.click(screen.getByRole('button', { name: /^backend$/i }))
    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: /instance 2/i }))

    await waitFor(() => {
      expect(store.getState().auth.user).toBeNull()
    })
    expect(sessionStorage.getItem('access_token')).toBeNull()
    expect(sessionStorage.getItem('refresh_token')).toBeNull()
  })

  it('clears the React Query cache when the logout button is clicked', async () => {
    const user = userEvent.setup()

    // Create a QueryClient we can spy on directly.
    const queryClient = createQueryClient()
    queryClient.setDefaultOptions({ queries: { retry: false } })
    const clearSpy = jest.spyOn(queryClient, 'clear')

    const store = configureStore({
      reducer: rootReducer,
      preloadedState: { auth: createMockAuthState() } as Partial<RootState>,
    })

    render(
      <ThemeProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <Sidebar />
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      </ThemeProvider>
    )

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(clearSpy).toHaveBeenCalledTimes(1)
  })
})
