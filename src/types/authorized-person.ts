export interface AuthorizedPerson {
  id: number
  first_name: string
  last_name: string
  date_of_birth: number
  gender: string
  email: string
  phone: string
  address: string
}

export interface CreateAuthorizedPersonRequest {
  first_name: string
  last_name: string
  date_of_birth: number
  gender: string
  email: string
  phone: string
  address: string
}

export interface CreateAuthorizedPersonPayload {
  first_name: string
  last_name: string
  date_of_birth?: number
  gender?: string
  email?: string
  phone?: string
  address?: string
  account_id: number
}
