import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  loginThunk,
  logoutThunk,
  setTokens,
  clearAuth,
  buildInitialState,
} from '@/store/slices/authSlice'
import * as authApi from '@/lib/api/auth'
import * as jwt from '@/lib/utils/jwt'

jest.mock('@/lib/api/auth')
jest.mock('@/lib/utils/jwt')

const createStore = () => configureStore({ reducer: { auth: authReducer } })

beforeEach(() => {
  jest.clearAllMocks()
  sessionStorage.clear()
})

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
    it('sets userType to "employee" when JWT has system_type employee', async () => {
      const tokens = { access_token: 'at', refresh_token: 'rt' }
      jest.mocked(authApi.login).mockResolvedValue(tokens)
      jest.mocked(jwt.decodeAuthToken).mockReturnValue({
        id: 1,
        email: 'a@b.com',
        role: 'EmployeeAdmin',
        permissions: ['employees.read'],
        system_type: 'employee',
      })

      const store = createStore()
      await store.dispatch(loginThunk({ email: 'a@b.com', password: 'pass' }))

      const state = store.getState().auth
      expect(state.userType).toBe('employee')
      expect(state.status).toBe('authenticated')
    })

    it('sets userType to "client" when JWT has system_type client', async () => {
      const tokens = { access_token: 'tok', refresh_token: 'ref' }
      jest.mocked(authApi.login).mockResolvedValue(tokens)
      jest.mocked(jwt.decodeAuthToken).mockReturnValue({
        id: 2,
        email: 'client@b.com',
        role: 'client',
        permissions: [],
        system_type: 'client',
      })

      const store = createStore()
      await store.dispatch(loginThunk({ email: 'client@b.com', password: 'pass' }))

      const state = store.getState().auth
      expect(state.userType).toBe('client')
      expect(state.status).toBe('authenticated')
    })

    it('sets authenticated state on success', async () => {
      const tokens = { access_token: 'at', refresh_token: 'rt' }
      const user = {
        id: 1,
        email: 'a@b.com',
        role: 'EmployeeAdmin',
        permissions: ['employees.read'],
        system_type: 'employee' as const,
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

  describe('setTokens', () => {
    it('sets userType from system_type when setTokens is called', () => {
      jest.mocked(jwt.decodeAuthToken).mockReturnValue({
        id: 2,
        email: 'client@b.com',
        role: 'client',
        permissions: [],
        system_type: 'client',
      })

      const store = createStore()
      store.dispatch(setTokens({ access_token: 'tok', refresh_token: 'ref' }))

      const state = store.getState().auth
      expect(state.userType).toBe('client')
      expect(state.status).toBe('authenticated')
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

  describe('session rehydration on store init', () => {
    afterEach(() => sessionStorage.clear())

    it('returns authenticated state when valid tokens exist in sessionStorage', () => {
      const mockUser = {
        id: 1,
        email: 'a@b.com',
        role: 'Employee',
        permissions: ['employees.read'],
        system_type: 'employee' as const,
      }
      jest.mocked(jwt.decodeAuthToken).mockReturnValue(mockUser)
      sessionStorage.setItem('access_token', 'stored-at')
      sessionStorage.setItem('refresh_token', 'stored-rt')

      const state = buildInitialState()

      expect(state.status).toBe('authenticated')
      expect(state.user).toEqual(mockUser)
      expect(state.accessToken).toBe('stored-at')
      expect(state.refreshToken).toBe('stored-rt')
      expect(state.userType).toBe('employee')
    })

    it('returns idle state when sessionStorage has no tokens', () => {
      const state = buildInitialState()

      expect(state.status).toBe('idle')
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
    })

    it('returns idle state when stored token cannot be decoded', () => {
      jest.mocked(jwt.decodeAuthToken).mockReturnValue(null)
      sessionStorage.setItem('access_token', 'invalid-token')
      sessionStorage.setItem('refresh_token', 'invalid-rt')

      const state = buildInitialState()

      expect(state.status).toBe('idle')
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
    })

    it('clearAuth resets to empty state even if sessionStorage still has tokens', () => {
      const mockUser = {
        id: 1,
        email: 'a@b.com',
        role: 'Employee',
        permissions: [],
        system_type: 'employee' as const,
      }
      jest.mocked(jwt.decodeAuthToken).mockReturnValue(mockUser)
      sessionStorage.setItem('access_token', 'stored-at')
      sessionStorage.setItem('refresh_token', 'stored-rt')

      const store = createStore()
      store.dispatch(clearAuth())
      const state = store.getState().auth

      expect(state.status).toBe('idle')
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
    })
  })
})
