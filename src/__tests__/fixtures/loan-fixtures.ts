import type { Loan, LoanRequest } from '@/types/loan'

export function createMockLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    id: 1,
    loan_number: 'LN-2026-00001',
    loan_type: 'CASH',
    account_number: '111000100000000011',
    amount: 500000,
    interest_rate: 8.5,
    nominal_interest_rate: 6.25,
    effective_interest_rate: 8.0,
    interest_type: 'FIXED',
    period: 60,
    installment_amount: 10234,
    contract_date: '2026-01-15',
    maturity_date: '2031-01-15',
    next_installment_amount: 10234,
    next_installment_date: '2026-04-15',
    remaining_debt: 480000,
    currency_code: 'RSD',
    status: 'ACTIVE',
    created_at: '2026-01-15T10:00:00Z',
    ...overrides,
  }
}

export function createMockLoanRequest(overrides: Partial<LoanRequest> = {}): LoanRequest {
  return {
    id: 1,
    client_id: 1,
    loan_type: 'CASH',
    interest_type: 'FIXED',
    amount: 500000,
    interest_rate: 8.5,
    currency_code: 'RSD',
    purpose: 'Renoviranje stana',
    monthly_salary: 120000,
    employment_status: 'EMPLOYED',
    employment_period: 5,
    period: 60,
    phone: '+381611234567',
    account_number: '111000100000000011',
    status: 'PENDING',
    created_at: '2026-03-13T10:00:00Z',
    ...overrides,
  }
}
