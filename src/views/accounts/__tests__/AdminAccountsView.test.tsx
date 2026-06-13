import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminAccountsView } from '@/views/accounts/AdminAccountsView'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useClientsHook from '@/hooks/useClients'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useClients')

const clientAna = {
  id: 1,
  first_name: 'Ana',
  last_name: 'Anić',
  email: 'ana@test.com',
  date_of_birth: 0,
}
const clientMarko = {
  id: 2,
  first_name: 'Marko',
  last_name: 'Marković',
  email: 'marko@test.com',
  date_of_birth: 0,
}
const clientJovana = {
  id: 3,
  first_name: 'Jovana',
  last_name: 'Jović',
  email: 'jovana@test.com',
  date_of_birth: 0,
}

const personalAna = createMockAccount({
  id: 1,
  account_category: 'personal',
  owner_id: 1,
  owner_name: 'Ana Anić',
})
const personalMarko = createMockAccount({
  id: 2,
  account_category: 'personal',
  owner_id: 2,
  owner_name: 'Marko Marković',
  account_number: '222000200000000022',
})
const companyAccount = createMockAccount({
  id: 3,
  account_category: 'business',
  owner_id: 3,
  owner_name: 'Jovana Jović',
  account_number: '333000300000000033',
  company: {
    name: 'Firma d.o.o.',
    registration_number: '12345678',
    tax_number: '123456789',
    activity_code: '01.1',
    address: 'Beograd',
  },
})

beforeEach(() => {
  jest.clearAllMocks()
  mockNavigate.mockClear()
  jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
    data: { accounts: [personalAna, personalMarko, companyAccount], total: 3 },
    isLoading: false,
  } as any)
  jest.mocked(useClientsHook.useAllClients).mockReturnValue({
    data: { clients: [clientAna, clientMarko, clientJovana], total: 3 },
  } as any)
})

describe('AdminAccountsView', () => {
  it('renders admin accounts page', () => {
    renderWithProviders(<AdminAccountsView />)
    expect(screen.getByText(/account management/i)).toBeInTheDocument()
  })

  it('shows create account button', () => {
    renderWithProviders(<AdminAccountsView />)
    expect(screen.getByText(/new account/i)).toBeInTheDocument()
  })

  it('shows client first and last name for personal accounts', () => {
    renderWithProviders(<AdminAccountsView />)
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.getByText('Marko Marković')).toBeInTheDocument()
  })

  it('shows owner name for company accounts', () => {
    renderWithProviders(<AdminAccountsView />)
    expect(screen.getByText('Jovana Jović')).toBeInTheDocument()
  })

  it('filters personal accounts by client name when typing in owner filter', async () => {
    renderWithProviders(<AdminAccountsView />)
    await userEvent.type(screen.getByPlaceholderText(/owner name/i), 'Anić')
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.queryByText('Marko Marković')).not.toBeInTheDocument()
    expect(screen.queryByText('Jovana Jović')).not.toBeInTheDocument()
  })

  it('filters company accounts by owner name when typing in owner filter', async () => {
    renderWithProviders(<AdminAccountsView />)
    await userEvent.type(screen.getByPlaceholderText(/owner name/i), 'Jovana')
    expect(screen.getByText('Jovana Jović')).toBeInTheDocument()
    expect(screen.queryByText('Ana Anić')).not.toBeInTheDocument()
    expect(screen.queryByText('Marko Marković')).not.toBeInTheDocument()
  })

  it('shows all accounts when owner filter is cleared', async () => {
    renderWithProviders(<AdminAccountsView />)
    const input = screen.getByPlaceholderText(/owner name/i)
    await userEvent.type(input, 'Ana')
    await userEvent.clear(input)
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.getByText('Marko Marković')).toBeInTheDocument()
    expect(screen.getByText('Jovana Jović')).toBeInTheDocument()
  })

  it('calls useAllAccounts with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminAccountsView />)
    expect(useAccountsHook.useAllAccounts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminAccountsView />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
      data: { accounts: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminAccountsView />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls useAllAccounts with page 2 when next arrow is clicked', async () => {
    jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
      data: { accounts: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminAccountsView />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useAccountsHook.useAllAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })

  it('routes bank-owned account Activity click to admin bank account activity page', async () => {
    const bankAccount = createMockAccount({
      id: 99,
      account_number: '999000900000000099',
      owner_name: 'EX Banka',
      account_type: 'bank',
      account_category: 'business',
    })
    jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
      data: { accounts: [bankAccount], total: 1 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminAccountsView />)
    await userEvent.click(screen.getByRole('button', { name: /activity/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/admin/bank-accounts/99/activity')
  })

  it('routes non-bank account Activity click to client activity page', async () => {
    const clientAccount = createMockAccount({
      id: 100,
      account_number: '111000100000000100',
      account_type: 'standard',
      account_category: 'business',
    })
    jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
      data: { accounts: [clientAccount], total: 1 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminAccountsView />)
    await userEvent.click(screen.getByRole('button', { name: /activity/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/accounts/100/activity')
  })

  it('resets to page 1 when filter changes', async () => {
    jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
      data: { accounts: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminAccountsView />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useAccountsHook.useAllAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    )

    const accountInput = screen.getByPlaceholderText(/account number/i)
    fireEvent.change(accountInput, { target: { value: '111' } })

    await waitFor(() =>
      expect(useAccountsHook.useAllAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, account_number_filter: '111' })
      )
    )
  })
})
