export interface EmployeeLimits {
  id: number
  employee_id: number
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

export interface ClientLimits {
  id: number
  client_id: number
  daily_limit: string
  monthly_limit: string
  transfer_limit: string
  set_by_employee: number
}

export interface LimitTemplate {
  id: number
  name: string
  description: string
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

export interface LimitTemplateListResponse {
  templates: LimitTemplate[]
}

export interface CreateLimitTemplatePayload {
  name: string
  description: string
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

export interface UpdateEmployeeLimitsPayload {
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

export interface UpdateClientLimitsPayload {
  daily_limit: string
  monthly_limit: string
  transfer_limit: string
}
