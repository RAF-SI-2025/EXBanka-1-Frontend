export type LoanType = 'CASH' | 'MORTGAGE' | 'AUTO' | 'REFINANCING' | 'STUDENT'
export type LoanStatus = 'ACTIVE' | 'PAID_OFF' | 'DELINQUENT'
export type LoanRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type InstallmentStatus = 'PAID' | 'UNPAID' | 'OVERDUE'
export type InterestType = 'FIXED' | 'VARIABLE'

export interface LoanInstallment {
  id: number
  installment_number: number
  due_date: string
  amount: number
  status: InstallmentStatus
}

export interface Loan {
  id: number
  loan_number: string
  loan_type: LoanType
  account_number: string
  amount: number
  interest_rate: number
  nominal_interest_rate?: number
  effective_interest_rate?: number
  interest_type?: InterestType
  period: number
  installment_amount: number
  contract_date?: string
  maturity_date?: string
  next_installment_amount?: number
  next_installment_date?: string
  remaining_debt?: number
  currency_code?: string
  status: LoanStatus
  created_at: string
  installments?: LoanInstallment[]
}

export interface LoanListResponse {
  loans: Loan[]
  total: number
}

export interface LoanRequest {
  id: number
  client_id?: number
  loan_type: LoanType
  interest_type?: InterestType
  account_number: string
  amount: number
  interest_rate: number
  currency_code?: string
  purpose?: string
  monthly_salary?: number
  employment_status?: string
  employment_period?: number
  repayment_period: number
  phone?: string
  status: LoanRequestStatus
  created_at: string
}

export interface LoanRequestListResponse {
  requests: LoanRequest[]
  total: number
}

export interface LoanFilters {
  loan_type?: LoanType
  account_number?: string
  status?: LoanStatus
  page?: number
  page_size?: number
}

export interface LoanRequestFilters {
  loan_type?: LoanType
  account_number?: string
  status?: string
  page?: number
  page_size?: number
}

export interface CreateLoanRequest {
  client_id: number
  loan_type: LoanType
  interest_type?: InterestType
  account_number: string
  amount: number
  currency_code?: string
  purpose?: string
  monthly_salary?: number
  employment_status?: string
  employment_period?: number
  repayment_period: number
  phone?: string
}
