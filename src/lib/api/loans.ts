import { apiClient } from '@/lib/api/axios'
import type {
  Loan,
  LoanListResponse,
  LoanRequest,
  LoanRequestListResponse,
  LoanFilters,
  LoanRequestFilters,
  CreateLoanRequest,
} from '@/types/loan'

export async function getLoans(): Promise<Loan[]> {
  const response = await apiClient.get<Loan[]>('/api/loans')
  return response.data
}

export async function getLoan(id: number): Promise<Loan> {
  const response = await apiClient.get<Loan>(`/api/loans/${id}`)
  return response.data
}

export async function createLoanRequest(payload: CreateLoanRequest): Promise<LoanRequest> {
  const response = await apiClient.post<LoanRequest>('/api/loans/request', payload)
  return response.data
}

export async function getLoanRequests(
  filters?: LoanRequestFilters
): Promise<LoanRequestListResponse> {
  const params = new URLSearchParams()
  if (filters?.loan_type) params.append('loan_type', filters.loan_type)
  if (filters?.account_number) params.append('account_number', filters.account_number)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<LoanRequestListResponse>('/api/loans/requests', { params })
  return response.data
}

export async function approveLoanRequest(id: number): Promise<void> {
  await apiClient.put(`/api/loans/requests/${id}/approve`)
}

export async function rejectLoanRequest(id: number): Promise<void> {
  await apiClient.put(`/api/loans/requests/${id}/reject`)
}

export async function getAllLoans(filters?: LoanFilters): Promise<LoanListResponse> {
  const params = new URLSearchParams()
  if (filters?.loan_type) params.append('loan_type', filters.loan_type)
  if (filters?.account_number) params.append('account_number', filters.account_number)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.page_size) params.append('page_size', String(filters.page_size))
  const response = await apiClient.get<LoanListResponse>('/api/loans/all', { params })
  return response.data
}
