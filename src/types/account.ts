export type AccountKind = 'CHECKING' | 'SAVINGS' | 'FOREIGN_CURRENCY' | 'BUSINESS'
export type AccountType = 'CURRENT' | 'TERM'
export type AccountCategory = 'PERSONAL' | 'COMPANY'
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'CLOSED'

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
  account_name: string
  currency_code: string
  account_kind: AccountKind
  account_type: AccountType
  account_category: AccountCategory
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
  total: number
}

export interface AccountFilters {
  name_filter?: string
  account_number_filter?: string
  type_filter?: string
  page?: number
  page_size?: number
}

export interface CreateAccountRequest {
  owner_id: number
  account_kind: AccountKind
  account_type: AccountType
  account_category?: AccountCategory
  currency_code: string
  initial_balance?: number
  create_card?: boolean
}

export interface UpdateAccountNameRequest {
  new_name: string
  client_id?: number
}

export interface UpdateAccountLimitsRequest {
  daily_limit?: number
  monthly_limit?: number
}
