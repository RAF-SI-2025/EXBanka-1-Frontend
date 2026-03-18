import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminLoanRequestsPage } from '@/pages/AdminLoanRequestsPage'
import * as useLoansHook from '@/hooks/useLoans'
import { createMockLoanRequest } from '@/__tests__/fixtures/loan-fixtures'

jest.mock('@/hooks/useLoans')

describe('AdminLoanRequestsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [createMockLoanRequest()], total_count: 1 },
      isLoading: false,
    } as any)
    jest
      .mocked(useLoansHook.useApproveLoanRequest)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
    jest
      .mocked(useLoansHook.useRejectLoanRequest)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  })

  it('renders loan requests page', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText(/zahtevi za kredite/i)).toBeInTheDocument()
    expect(screen.getByText(/na čekanju/i)).toBeInTheDocument()
  })

  it('shows approve and reject buttons for pending requests', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText(/odobri/i)).toBeInTheDocument()
    expect(screen.getByText(/odbij/i)).toBeInTheDocument()
  })
})
