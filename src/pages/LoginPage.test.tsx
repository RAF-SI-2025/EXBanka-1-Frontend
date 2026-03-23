import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoginPage } from '@/pages/LoginPage'
import * as authApi from '@/lib/api/auth'
import * as jwt from '@/lib/utils/jwt'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'
import { rootReducer } from '@/store'
import { ThemeProvider } from '@/contexts/ThemeContext'

jest.mock('@/lib/api/auth')
jest.mock('@/lib/utils/jwt')

beforeEach(() => jest.clearAllMocks())

function renderLoginWithRoutes(preloadedState: object) {
  const store = configureStore({ reducer: rootReducer, preloadedState: preloadedState as never })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<div>client home</div>} />
              <Route path="/admin/accounts" element={<div>admin accounts</div>} />
              <Route path="/employees" element={<div>employees page</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  )
}

describe('LoginPage', () => {
  it('renders the login form', () => {
    renderWithProviders(<LoginPage />, { route: '/login' })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('dispatches login on form submit', async () => {
    const tokens = { access_token: 'at', refresh_token: 'rt' }
    const user = {
      id: 1,
      email: 'a@b.com',
      role: 'EmployeeAdmin',
      permissions: [],
      system_type: 'employee' as const,
    }
    jest.mocked(authApi.login).mockResolvedValue(tokens)
    jest.mocked(jwt.decodeAuthToken).mockReturnValue(user)

    renderWithProviders(<LoginPage />, { route: '/login' })

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'Password12' })
    })
  })

  it('redirects authenticated Employee to /admin/accounts', () => {
    renderLoginWithRoutes({
      auth: createMockAuthState({ user: createMockAuthUser({ role: 'Employee' }) }),
    })
    expect(screen.getByText('admin accounts')).toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
  })

  it('redirects authenticated EmployeeAdmin to /admin/accounts', () => {
    renderLoginWithRoutes({
      auth: createMockAuthState({ user: createMockAuthUser({ role: 'EmployeeAdmin' }) }),
    })
    expect(screen.getByText('admin accounts')).toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
  })

  it('redirects authenticated Client to /home', () => {
    renderLoginWithRoutes({
      auth: createMockAuthState({
        user: createMockAuthUser({ role: 'Client' }),
        userType: 'client',
      }),
    })
    expect(screen.getByText('client home')).toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
  })
})
