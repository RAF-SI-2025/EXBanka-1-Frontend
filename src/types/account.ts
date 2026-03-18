export type AccountType = 'CURRENT' | 'FOREIGN_CURRENCY'
export type OwnerType = 'PERSONAL' | 'BUSINESS'
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export interface Company {
  name: string
  registration_number: string
  tax_number: string
  activity_code: string
  address: string
}

export interface Account {
  id: number
  account_number: string
  name: string
  currency: string
  account_type: AccountType
  owner_type: OwnerType
  subtype: string
  balance: number
  available_balance: number
  status: AccountStatus
  owner_id: number
  owner_name?: string
  daily_limit?: number
  monthly_limit?: number
  company?: Company
  created_at?: string
}

export interface AccountListResponse {
  accounts: Account[]
  total_count: number
}

export interface AccountFilters {
  owner_name?: string
  account_number?: string
  page?: number
  page_size?: number
}

export interface CreateAccountRequest {
  name: string
  owner_id: number
  account_type: AccountType
  owner_type: OwnerType
  subtype: string
  currency: string
  initial_balance?: number
  create_card?: boolean
  daily_limit?: number
  monthly_limit?: number
  company?: Company
}

export interface UpdateAccountRequest {
  name?: string
  daily_limit?: number
  monthly_limit?: number
}
