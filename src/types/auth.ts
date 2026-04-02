export interface LoginRequest {
  email: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface PasswordResetRequestPayload {
  email: string
}

export interface PasswordResetPayload {
  token: string
  new_password: string
  confirm_password: string
}

export interface AccountActivationPayload {
  token: string
  password: string
  confirm_password: string
}

export interface AuthUser {
  id: number
  email: string
  role: string
  permissions: string[]
}
