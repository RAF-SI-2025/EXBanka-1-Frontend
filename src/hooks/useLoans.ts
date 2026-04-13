import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLoans,
  getLoan,
  getLoanInstallments,
  getLoanRequests,
  approveLoanRequest,
  rejectLoanRequest,
  getAllLoans,
} from '@/lib/api/loans'
import type { LoanFilters, LoanRequestFilters } from '@/types/loan'

export function useLoans() {
  return useQuery({
    queryKey: ['loans', 'me'],
    queryFn: () => getLoans(),
  })
}

export function useLoan(id: number) {
  return useQuery({
    queryKey: ['loan', id],
    queryFn: () => getLoan(id),
    enabled: id > 0,
  })
}

export function useLoanInstallments(loanId: number) {
  return useQuery({
    queryKey: ['loan-installments', loanId],
    queryFn: () => getLoanInstallments(loanId),
    enabled: loanId > 0,
  })
}

export function useLoanRequests(filters?: LoanRequestFilters) {
  return useQuery({
    queryKey: ['loan-requests', filters],
    queryFn: () => getLoanRequests(filters),
  })
}

export function useApproveLoanRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approveLoanRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-requests'] })
    },
  })
}

export function useRejectLoanRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => rejectLoanRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-requests'] })
    },
  })
}

export function useAllLoans(filters?: LoanFilters) {
  return useQuery({
    queryKey: ['loans', 'all', filters],
    queryFn: () => getAllLoans(filters),
  })
}
