import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as authApi from '@/lib/api/auth'
import { decodeAuthToken } from '@/lib/utils/jwt'
import type { AuthUser, LoginRequest, AuthTokens } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  userType: 'client' | 'employee' | null
  accessToken: string | null
  refreshToken: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}

const initialState: AuthState = {
  user: null,
  userType: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  error: null,
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const tokens = await authApi.login(credentials)
      const user = decodeAuthToken(tokens.access_token)
      if (!user) {
        return rejectWithValue('Failed to decode token')
      }
      sessionStorage.setItem('access_token', tokens.access_token)
      sessionStorage.setItem('refresh_token', tokens.refresh_token)
      return { tokens, user }
    } catch {
      return rejectWithValue('Invalid credentials')
    }
  }
)

export const clientLoginThunk = createAsyncThunk(
  'auth/clientLogin',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const tokens = await authApi.clientLogin(credentials)
      const user = decodeAuthToken(tokens.access_token)
      if (!user) {
        return rejectWithValue('Failed to decode token')
      }
      sessionStorage.setItem('access_token', tokens.access_token)
      sessionStorage.setItem('refresh_token', tokens.refresh_token)
      return { tokens, user }
    } catch {
      return rejectWithValue('Invalid credentials')
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const state = getState() as { auth: AuthState }
  const refreshToken = state.auth.refreshToken
  if (refreshToken) {
    try {
      await authApi.logout(refreshToken)
    } catch {
      // Logout API failure shouldn't block client-side cleanup
    }
  }
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('refresh_token')
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<AuthTokens>) {
      state.accessToken = action.payload.access_token
      state.refreshToken = action.payload.refresh_token
      const user = decodeAuthToken(action.payload.access_token)
      if (user) {
        state.user = user
        state.status = 'authenticated'
      }
    },
    clearAuth() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.userType = 'employee'
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.access_token
        state.refreshToken = action.payload.tokens.refresh_token
        state.error = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })
      .addCase(clientLoginThunk.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(clientLoginThunk.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.userType = 'client'
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.access_token
        state.refreshToken = action.payload.tokens.refresh_token
        state.error = null
      })
      .addCase(clientLoginThunk.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })
      .addCase(logoutThunk.fulfilled, () => {
        return initialState
      })
  },
})

export const { setTokens, clearAuth } = authSlice.actions
export default authSlice.reducer
