import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminLoanRequestsPage } from '@/pages/AdminLoanRequestsPage'
import * as useLoansHook from '@/hooks/useLoans'
import * as useClientsHook from '@/hooks/useClients'
import { createMockLoanRequest } from '@/__tests__/fixtures/loan-fixtures'

jest.mock('@/hooks/useLoans')
jest.mock('@/hooks/useClients')

const mockClient = {
  id: 1,
  first_name: 'Ana',
  last_name: 'Anić',
  email: 'ana@test.com',
  date_of_birth: 0,
}

const mockRequest = createMockLoanRequest({
  id: 1,
  client_id: 1,
  account_number: '111000100000000011',
  amount: 500000,
  currency_code: 'RSD',
  repayment_period: 60,
  purpose: 'Renoviranje stana',
})

describe('AdminLoanRequestsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useLoansHook.useApproveLoanRequest).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(useLoansHook.useRejectLoanRequest).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
  })

  it('renders the page heading', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText(/loan requests/i)).toBeInTheDocument()
  })

  it('shows client full name from client lookup', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
  })

  it('shows account number, amount, currency, repayment period and purpose', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText('111000100000000011')).toBeInTheDocument()
    expect(screen.getByText(/500\.000/)).toBeInTheDocument()
    expect(screen.getAllByText(/RSD/).length).toBeGreaterThan(0)
    expect(screen.getByText(/60 months/i)).toBeInTheDocument()
    expect(screen.getByText('Renoviranje stana')).toBeInTheDocument()
  })

  it('shows approve and reject buttons', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })

  it('calls approve mutation with request id when approve clicked', async () => {
    const approveMutate = jest.fn()
    jest.mocked(useLoansHook.useApproveLoanRequest).mockReturnValue({
      mutate: approveMutate,
      isPending: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminLoanRequestsPage />)
    await user.click(screen.getByRole('button', { name: /approve/i }))
    expect(approveMutate).toHaveBeenCalledWith(1)
  })

  it('calls reject mutation with request id when reject clicked', async () => {
    const rejectMutate = jest.fn()
    jest.mocked(useLoansHook.useRejectLoanRequest).mockReturnValue({
      mutate: rejectMutate,
      isPending: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminLoanRequestsPage />)
    await user.click(screen.getByRole('button', { name: /reject/i }))
    expect(rejectMutate).toHaveBeenCalledWith(1)
  })

  it('filters rows by client name', async () => {
    const secondRequest = createMockLoanRequest({ id: 2, client_id: 2 })
    const secondClient = {
      id: 2,
      first_name: 'Marko',
      last_name: 'Marković',
      email: 'marko@test.com',
      date_of_birth: 0,
    }
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [mockRequest, secondRequest], total: 2 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient, secondClient], total: 2 },
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.getByText('Marko Marković')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText(/client name/i), 'Ana')
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.queryByText('Marko Marković')).not.toBeInTheDocument()
  })

  it('shows empty state when no requests', () => {
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [], total: 0 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText(/no requests/i)).toBeInTheDocument()
  })

  it('calls useLoanRequests with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(useLoansHook.useLoanRequests).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls useLoanRequests with page 2 when next arrow is clicked', async () => {
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoanRequestsPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useLoansHook.useLoanRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })

  it('resets to page 1 when filter changes', async () => {
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoanRequestsPage />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useLoansHook.useLoanRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    )

    const accountInput = screen.getByPlaceholderText(/account number/i)
    fireEvent.change(accountInput, { target: { value: 'ACC-001' } })

    await waitFor(() =>
      expect(useLoansHook.useLoanRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, account_number: 'ACC-001' })
      )
    )
  })
})
