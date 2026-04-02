import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminCardRequestsPage } from '@/pages/AdminCardRequestsPage'
import * as useCardsHook from '@/hooks/useCards'
import * as useClientsHook from '@/hooks/useClients'
import { createMockCardRequest } from '@/__tests__/fixtures/card-fixtures'

jest.mock('@/hooks/useCards')
jest.mock('@/hooks/useClients')

const mockClient = {
  id: 1,
  first_name: 'Ana',
  last_name: 'Anić',
  email: 'ana@test.com',
  date_of_birth: 0,
}

const mockRequest = createMockCardRequest({
  id: 1,
  client_id: 1,
  account_number: '111000100000000011',
  card_type: 'debit',
})

describe('AdminCardRequestsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useApproveCardRequest).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
    jest.mocked(useCardsHook.useRejectCardRequest).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminCardRequestsPage />)
    expect(screen.getByText(/card requests/i)).toBeInTheDocument()
  })

  it('renders table rows with client name, account number and card type', () => {
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminCardRequestsPage />)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Anić')).toBeInTheDocument()
    expect(screen.getByText('111000100000000011')).toBeInTheDocument()
    expect(screen.getByText('debit')).toBeInTheDocument()
  })

  it('calls approve mutation with request id when Approve clicked', async () => {
    const approveMutate = jest.fn()
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useApproveCardRequest).mockReturnValue({
      mutate: approveMutate,
      isPending: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminCardRequestsPage />)
    await user.click(screen.getByRole('button', { name: /^approve$/i }))
    expect(approveMutate).toHaveBeenCalledWith(1)
  })

  it('opens deny dialog when Deny clicked', async () => {
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminCardRequestsPage />)
    await user.click(screen.getByRole('button', { name: /^deny$/i }))
    expect(screen.getByText(/deny card request/i)).toBeInTheDocument()
  })

  it('calls reject mutation with reason when dialog confirmed', async () => {
    const rejectMutate = jest.fn()
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [mockRequest], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [mockClient], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useRejectCardRequest).mockReturnValue({
      mutate: rejectMutate,
      isPending: false,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<AdminCardRequestsPage />)
    await user.click(screen.getByRole('button', { name: /^deny$/i }))
    await user.type(screen.getByPlaceholderText(/reason/i), 'Not eligible')
    await user.click(screen.getByRole('button', { name: /confirm deny/i }))
    expect(rejectMutate).toHaveBeenCalledWith({ id: 1, reason: 'Not eligible' })
  })

  it('calls useCardRequests with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminCardRequestsPage />)
    expect(useCardsHook.useCardRequests).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminCardRequestsPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('calls useCardRequests with page 2 when next arrow clicked', async () => {
    jest.mocked(useCardsHook.useCardRequests).mockReturnValue({
      data: { requests: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminCardRequestsPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useCardsHook.useCardRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })
})
