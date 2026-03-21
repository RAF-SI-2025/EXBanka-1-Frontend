import { screen } from '@testing-library/react'
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
    expect(screen.getByText(/zahtevi za kredite/i)).toBeInTheDocument()
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
    expect(screen.getByText(/60 mes/i)).toBeInTheDocument()
    expect(screen.getByText('Renoviranje stana')).toBeInTheDocument()
  })

  it('shows approve and reject buttons', () => {
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByRole('button', { name: /odobri/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /odbij/i })).toBeInTheDocument()
  })

  it('calls approve mutation with request id when approve clicked', async () => {
    const approveMutate = jest.fn()
    jest.mocked(useLoansHook.useApproveLoanRequest).mockReturnValue({
      mutate: approveMutate,
      isPending: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminLoanRequestsPage />)
    await user.click(screen.getByRole('button', { name: /odobri/i }))
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
    await user.click(screen.getByRole('button', { name: /odbij/i }))
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

    await user.type(screen.getByPlaceholderText(/ime klijenta/i), 'Ana')
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.queryByText('Marko Marković')).not.toBeInTheDocument()
  })

  it('shows empty state when no requests', () => {
    jest.mocked(useLoansHook.useLoanRequests).mockReturnValue({
      data: { requests: [], total: 0 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoanRequestsPage />)
    expect(screen.getByText(/nema zahteva/i)).toBeInTheDocument()
  })
})
