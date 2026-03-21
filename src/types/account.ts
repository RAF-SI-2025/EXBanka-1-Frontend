export type AccountKind = 'current' | 'foreign'
export type AccountType = string
export type AccountCategory = 'personal' | 'business'
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
  account_type: string
  account_category?: AccountCategory
  currency_code: string
  initial_balance?: number
  create_card?: boolean
  card_brand?: 'visa' | 'mastercard' | 'dinacard'
}

export interface UpdateAccountNameRequest {
  new_name: string
  client_id?: number
}

export interface UpdateAccountLimitsRequest {
  daily_limit?: number
  monthly_limit?: number
}
