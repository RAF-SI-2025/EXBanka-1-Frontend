import axios from 'axios'

// Build-time constants injected by Vite's `define` from VITE_API_HOST /
// VITE_API_VERSION (see vite.config.ts and .env.development / .env.production).
// In Jest the constants are undeclared, so the fallback values are used.
declare const __API_HOST__: string | undefined
declare const __API_VERSION__: string | undefined

const API_HOST = typeof __API_HOST__ !== 'undefined' ? __API_HOST__ : 'http://localhost:8080'
export const API_VERSION = typeof __API_VERSION__ !== 'undefined' ? __API_VERSION__ : 'v3'
export const API_BASE_URL = `${API_HOST}/api/${API_VERSION}`

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = sessionStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          sessionStorage.setItem('access_token', data.access_token)
          sessionStorage.setItem('refresh_token', data.refresh_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return apiClient(originalRequest)
        } catch {
          sessionStorage.removeItem('access_token')
          sessionStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
