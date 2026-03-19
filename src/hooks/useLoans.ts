import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLoans,
  getLoan,
  getLoanRequests,
  approveLoanRequest,
  rejectLoanRequest,
  getAllLoans,
} from '@/lib/api/loans'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import type { LoanFilters, LoanRequestFilters } from '@/types/loan'

export function useLoans() {
  const user = useAppSelector(selectCurrentUser)
  const clientId = user?.id ?? 0
  return useQuery({
    queryKey: ['loans', 'client', clientId],
    queryFn: () => getLoans(clientId),
    enabled: clientId > 0,
  })
}

export function useLoan(id: number) {
  return useQuery({
    queryKey: ['loan', id],
    queryFn: () => getLoan(id),
    enabled: id > 0,
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
