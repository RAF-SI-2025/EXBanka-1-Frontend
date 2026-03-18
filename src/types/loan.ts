export type LoanType = 'CASH' | 'MORTGAGE' | 'AUTO' | 'REFINANCING' | 'STUDENT'
export type LoanStatus = 'ACTIVE' | 'PAID_OFF' | 'DELINQUENT'
export type LoanRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type InstallmentStatus = 'PAID' | 'UNPAID' | 'OVERDUE'

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
  period: number
  installment_amount: number
  status: LoanStatus
  created_at: string
  installments?: LoanInstallment[]
}

export interface LoanListResponse {
  loans: Loan[]
  total_count: number
}

export interface LoanRequest {
  id: number
  loan_type: LoanType
  account_number: string
  amount: number
  period: number
  interest_rate: number
  status: LoanRequestStatus
  created_at: string
}

export interface LoanRequestListResponse {
  requests: LoanRequest[]
  total_count: number
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
  page?: number
  page_size?: number
}

export interface CreateLoanRequest {
  loan_type: LoanType
  account_number: string
  amount: number
  period: number
  currency_code?: string
}
