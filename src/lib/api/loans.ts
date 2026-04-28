import { apiClient } from '@/lib/api/axios'
import type {
  Loan,
  LoanListResponse,
  LoanInstallment,
  LoanInstallmentListResponse,
  LoanRequest,
  LoanRequestListResponse,
  LoanFilters,
  LoanRequestFilters,
  CreateLoanRequest,
} from '@/types/loan'

export async function getLoans(): Promise<LoanListResponse> {
  const response = await apiClient.get<LoanListResponse>('/me/loans')
  return response.data
}

export async function getLoan(id: number): Promise<Loan> {
  const response = await apiClient.get<Loan>(`/me/loans/${id}`)
  return response.data
}

export async function createLoanRequest(payload: CreateLoanRequest): Promise<LoanRequest> {
  const response = await apiClient.post<LoanRequest>('/me/loan-requests', payload)
  return response.data
}

export async function getLoanRequests(
  filters?: LoanRequestFilters
): Promise<LoanRequestListResponse> {
  const params = new URLSearchParams()
  if (filters?.loan_type) params.append('loan_type_filter', filters.loan_type)
  if (filters?.account_number) params.append('account_number_filter', filters.account_number)
  if (filters?.status) params.append('status_filter', filters.status)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<LoanRequestListResponse>('/loan-requests', { params })
  return response.data
}

export async function approveLoanRequest(id: number): Promise<void> {
  await apiClient.post(`/loan-requests/${id}/approve`)
}

export async function rejectLoanRequest(id: number): Promise<void> {
  await apiClient.post(`/loan-requests/${id}/reject`)
}

export async function getLoanInstallments(loanId: number): Promise<LoanInstallment[]> {
  const response = await apiClient.get<LoanInstallmentListResponse>(
    `/me/loans/${loanId}/installments`
  )
  return response.data.installments ?? []
}

export async function getAllLoans(filters?: LoanFilters): Promise<LoanListResponse> {
  const params = new URLSearchParams()
  if (filters?.loan_type) params.append('loan_type_filter', filters.loan_type)
  if (filters?.account_number) params.append('account_number_filter', filters.account_number)
  if (filters?.status) params.append('status_filter', filters.status)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<LoanListResponse>('/loans', { params })
  return response.data
}
