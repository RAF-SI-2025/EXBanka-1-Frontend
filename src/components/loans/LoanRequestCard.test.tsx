import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanRequestCard } from '@/components/loans/LoanRequestCard'
import { createMockLoanRequest } from '@/__tests__/fixtures/loan-fixtures'

describe('LoanRequestCard', () => {
  const mockOnApprove = jest.fn()
  const mockOnReject = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loan request amount', () => {
    const request = createMockLoanRequest({ amount: 500000 })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    expect(screen.getByText(/500\.000/)).toBeInTheDocument()
  })

  it('renders loan type label', () => {
    const request = createMockLoanRequest({ loan_type: 'CASH' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    expect(screen.getByText(/gotovinski/i)).toBeInTheDocument()
  })

  it('renders applicant account number', () => {
    const request = createMockLoanRequest({ account_number: '111000100000000011' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    expect(screen.getByText('111000100000000011')).toBeInTheDocument()
  })

  it('shows Approve and Reject buttons when status is PENDING', () => {
    const request = createMockLoanRequest({ status: 'PENDING' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    expect(screen.getByRole('button', { name: /odobri/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /odbij/i })).toBeInTheDocument()
  })

  it('calls onApprove with request id when Approve is clicked', async () => {
    const request = createMockLoanRequest({ id: 42, status: 'PENDING' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /odobri/i }))
    expect(mockOnApprove).toHaveBeenCalledWith(42)
  })

  it('calls onReject with request id when Reject is clicked', async () => {
    const request = createMockLoanRequest({ id: 42, status: 'PENDING' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /odbij/i }))
    expect(mockOnReject).toHaveBeenCalledWith(42)
  })

  it('disables both buttons when approving is true', () => {
    const request = createMockLoanRequest({ status: 'PENDING' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={true}
        rejecting={false}
      />
    )
    expect(screen.getByRole('button', { name: /odobri/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /odbij/i })).toBeDisabled()
  })

  it('disables both buttons when rejecting is true', () => {
    const request = createMockLoanRequest({ status: 'PENDING' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={true}
      />
    )
    expect(screen.getByRole('button', { name: /odobri/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /odbij/i })).toBeDisabled()
  })

  it('displays interest type when present', () => {
    const request = createMockLoanRequest({ interest_type: 'FIXED' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    expect(screen.getByText(/fiksna/i)).toBeInTheDocument()
  })

  it('displays currency when present', () => {
    const request = createMockLoanRequest({ currency_code: 'EUR' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    expect(screen.getAllByText(/EUR/).length).toBeGreaterThan(0)
  })

  it('displays purpose when present', () => {
    const request = createMockLoanRequest({ purpose: 'Renoviranje stana' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    expect(screen.getByText('Renoviranje stana')).toBeInTheDocument()
  })

  it('displays phone when present', () => {
    const request = createMockLoanRequest({ phone: '+381611234567' })
    renderWithProviders(
      <LoanRequestCard
        request={request}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        approving={false}
        rejecting={false}
      />
    )
    expect(screen.getByText('+381611234567')).toBeInTheDocument()
  })
})
