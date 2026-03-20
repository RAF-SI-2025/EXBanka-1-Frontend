import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ClientLoginPage } from '@/pages/ClientLoginPage'
import * as authApi from '@/lib/api/auth'
import * as jwt from '@/lib/utils/jwt'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'
import { rootReducer } from '@/store'
import { ThemeProvider } from '@/contexts/ThemeContext'

jest.mock('@/lib/api/auth')
jest.mock('@/lib/utils/jwt')

beforeEach(() => jest.clearAllMocks())

function renderClientLoginWithRoutes(preloadedState: object) {
  const store = configureStore({ reducer: rootReducer, preloadedState: preloadedState as never })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/client-login']}>
            <Routes>
              <Route path="/client-login" element={<ClientLoginPage />} />
              <Route path="/home" element={<div>client home</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  )
}

describe('ClientLoginPage', () => {
  it('renders the login form', () => {
    renderWithProviders(<ClientLoginPage />, { route: '/client-login' })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('dispatches clientLogin on form submit', async () => {
    const tokens = { access_token: 'at', refresh_token: 'rt' }
    const user = { id: 2, email: 'client@b.com', role: 'Client', permissions: [] }
    jest.mocked(authApi.clientLogin).mockResolvedValue(tokens)
    jest.mocked(jwt.decodeAuthToken).mockReturnValue(user)

    renderWithProviders(<ClientLoginPage />, { route: '/client-login' })

    await userEvent.type(screen.getByLabelText(/email/i), 'client@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password12')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(authApi.clientLogin).toHaveBeenCalledWith({
        email: 'client@b.com',
        password: 'Password12',
      })
    })
  })

  it('redirects to /home when userType is client', async () => {
    renderClientLoginWithRoutes({
      auth: createMockAuthState({
        userType: 'client',
        user: createMockAuthUser({ role: 'Client' }),
      }),
    })
    await waitFor(() => {
      expect(screen.getByText('client home')).toBeInTheDocument()
    })
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
  })

  it('shows form when userType is not client', () => {
    renderClientLoginWithRoutes({
      auth: createMockAuthState({ userType: null, status: 'idle', user: null, accessToken: null }),
    })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
