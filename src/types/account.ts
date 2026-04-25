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
  is_bank_account?: boolean
  daily_limit?: number
  monthly_limit?: number
  daily_spending?: number
  monthly_spending?: number
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
  client_id?: number
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

export interface AccountActivityEntry {
  id: number
  entry_type: 'debit' | 'credit'
  amount: string
  currency: string
  balance_before: string
  balance_after: string
  description: string
  reference_type: string
  reference_id: string
  occurred_at: number
}

export interface AccountActivityResponse {
  entries: AccountActivityEntry[]
  total_count: number
}

export interface AccountActivityFilters {
  page?: number
  page_size?: number
}
