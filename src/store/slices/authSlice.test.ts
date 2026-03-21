import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  loginThunk,
  clientLoginThunk,
  logoutThunk,
  setTokens,
  clearAuth,
} from '@/store/slices/authSlice'
import * as authApi from '@/lib/api/auth'
import * as jwt from '@/lib/utils/jwt'

jest.mock('@/lib/api/auth')
jest.mock('@/lib/utils/jwt')

const createStore = () => configureStore({ reducer: { auth: authReducer } })

beforeEach(() => jest.clearAllMocks())

describe('authSlice', () => {
  describe('clearAuth', () => {
    it('resets state to initial', () => {
      const store = createStore()
      store.dispatch(clearAuth())
      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.status).toBe('idle')
    })
  })

  describe('loginThunk', () => {
    it('sets userType to employee on success', async () => {
      const tokens = { access_token: 'at', refresh_token: 'rt' }
      jest.mocked(authApi.login).mockResolvedValue(tokens)
      jest.mocked(jwt.decodeAuthToken).mockReturnValue({
        id: 1,
        email: 'a@b.com',
        role: 'EmployeeAdmin',
        permissions: ['employees.read'],
      })

      const store = createStore()
      await store.dispatch(loginThunk({ email: 'a@b.com', password: 'pass' }))

      expect(store.getState().auth.userType).toBe('employee')
    })

    it('sets authenticated state on success', async () => {
      const tokens = { access_token: 'at', refresh_token: 'rt' }
      const user = {
        id: 1,
        email: 'a@b.com',
        role: 'EmployeeAdmin',
        permissions: ['employees.read'],
      }
      jest.mocked(authApi.login).mockResolvedValue(tokens)
      jest.mocked(jwt.decodeAuthToken).mockReturnValue(user)

      const store = createStore()
      await store.dispatch(loginThunk({ email: 'a@b.com', password: 'pass' }))

      const state = store.getState().auth
      expect(state.status).toBe('authenticated')
      expect(state.user).toEqual(user)
      expect(state.accessToken).toBe('at')
      expect(state.refreshToken).toBe('rt')
    })

    it('sets error state on failure', async () => {
      jest.mocked(authApi.login).mockRejectedValue(new Error('fail'))

      const store = createStore()
      await store.dispatch(loginThunk({ email: 'a@b.com', password: 'bad' }))

      const state = store.getState().auth
      expect(state.status).toBe('error')
      expect(state.error).toBe('Invalid credentials')
    })
  })

  describe('clientLoginThunk', () => {
    it('sets authenticated state on success', async () => {
      const tokens = { access_token: 'at', refresh_token: 'rt' }
      const user = { id: 2, email: 'client@b.com', role: 'Client', permissions: [] }
      jest.mocked(authApi.clientLogin).mockResolvedValue(tokens)
      jest.mocked(jwt.decodeAuthToken).mockReturnValue(user)

      const store = createStore()
      await store.dispatch(clientLoginThunk({ email: 'client@b.com', password: 'pass' }))

      const state = store.getState().auth
      expect(state.status).toBe('authenticated')
      expect(state.user).toEqual(user)
      expect(state.accessToken).toBe('at')
    })

    it('sets userType to client on success', async () => {
      const tokens = { access_token: 'at', refresh_token: 'rt' }
      jest.mocked(authApi.clientLogin).mockResolvedValue(tokens)
      jest
        .mocked(jwt.decodeAuthToken)
        .mockReturnValue({ id: 2, email: 'c@b.com', role: 'Client', permissions: [] })

      const store = createStore()
      await store.dispatch(clientLoginThunk({ email: 'c@b.com', password: 'pass' }))

      expect(store.getState().auth.userType).toBe('client')
    })

    it('sets error state on failure', async () => {
      jest.mocked(authApi.clientLogin).mockRejectedValue(new Error('fail'))

      const store = createStore()
      await store.dispatch(clientLoginThunk({ email: 'client@b.com', password: 'bad' }))

      const state = store.getState().auth
      expect(state.status).toBe('error')
      expect(state.error).toBe('Invalid credentials')
    })
  })

  describe('logoutThunk', () => {
    it('clears auth state', async () => {
      jest.mocked(authApi.logout).mockResolvedValue(undefined)

      const store = createStore()
      store.dispatch(setTokens({ access_token: 'at', refresh_token: 'rt' }))
      await store.dispatch(logoutThunk())

      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.status).toBe('idle')
    })
  })
})
