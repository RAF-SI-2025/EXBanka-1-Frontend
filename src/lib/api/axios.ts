import axios from 'axios'
import { getCurrentHost } from '@/lib/api/backendHost'

// Build-time constant injected by Vite's `define` from VITE_API_VERSION
// (see vite.config.ts and .env.development / .env.production). The host is
// no longer build-time fixed — it is selected at runtime via backendHost.ts
// so users can switch between localhost / bytenity instances / a custom URL.
declare const __API_VERSION__: string | undefined

export const API_VERSION = typeof __API_VERSION__ !== 'undefined' ? __API_VERSION__ : 'v3'

export function getApiBaseUrl(): string {
  return `${getCurrentHost()}/api/${API_VERSION}`
}

export const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = sessionStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
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
