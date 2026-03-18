import type { Loan, LoanRequest } from '@/types/loan'

export function createMockLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    id: 1,
    loan_number: 'LN-2026-00001',
    loan_type: 'CASH',
    account_number: '111000100000000011',
    amount: 500000,
    interest_rate: 8.5,
    period: 60,
    installment_amount: 10234,
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

export function createMockLoanRequest(overrides: Partial<LoanRequest> = {}): LoanRequest {
  return {
    id: 1,
    loan_type: 'CASH',
    account_number: '111000100000000011',
    amount: 500000,
    period: 60,
    interest_rate: 8.5,
    status: 'PENDING',
    created_at: '2026-03-13T10:00:00Z',
    ...overrides,
  }
}
