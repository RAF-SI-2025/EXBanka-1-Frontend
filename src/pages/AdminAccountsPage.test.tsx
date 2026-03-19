import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminAccountsPage } from '@/pages/AdminAccountsPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useClientsHook from '@/hooks/useClients'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

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
  account_category: 'PERSONAL',
  owner_id: 1,
  owner_name: 'Ana Anić',
})
const personalMarko = createMockAccount({
  id: 2,
  account_category: 'PERSONAL',
  owner_id: 2,
  owner_name: 'Marko Marković',
  account_number: '222000200000000022',
})
const companyAccount = createMockAccount({
  id: 3,
  account_category: 'COMPANY',
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
  jest.mocked(useAccountsHook.useAllAccounts).mockReturnValue({
    data: { accounts: [personalAna, personalMarko, companyAccount], total: 3 },
    isLoading: false,
  } as any)
  jest.mocked(useClientsHook.useAllClients).mockReturnValue({
    data: { clients: [clientAna, clientMarko, clientJovana], total: 3 },
  } as any)
})

describe('AdminAccountsPage', () => {
  it('renders admin accounts page', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByText(/upravljanje računima/i)).toBeInTheDocument()
  })

  it('shows create account button', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByText(/novi račun/i)).toBeInTheDocument()
  })

  it('shows client first and last name for personal accounts', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.getByText('Marko Marković')).toBeInTheDocument()
  })

  it('shows owner name for company accounts', () => {
    renderWithProviders(<AdminAccountsPage />)
    expect(screen.getByText('Jovana Jović')).toBeInTheDocument()
  })

  it('filters personal accounts by client name when typing in owner filter', async () => {
    renderWithProviders(<AdminAccountsPage />)
    await userEvent.type(screen.getByPlaceholderText(/ime vlasnika/i), 'Anić')
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.queryByText('Marko Marković')).not.toBeInTheDocument()
    expect(screen.queryByText('Jovana Jović')).not.toBeInTheDocument()
  })

  it('filters company accounts by owner name when typing in owner filter', async () => {
    renderWithProviders(<AdminAccountsPage />)
    await userEvent.type(screen.getByPlaceholderText(/ime vlasnika/i), 'Jovana')
    expect(screen.getByText('Jovana Jović')).toBeInTheDocument()
    expect(screen.queryByText('Ana Anić')).not.toBeInTheDocument()
    expect(screen.queryByText('Marko Marković')).not.toBeInTheDocument()
  })

  it('shows all accounts when owner filter is cleared', async () => {
    renderWithProviders(<AdminAccountsPage />)
    const input = screen.getByPlaceholderText(/ime vlasnika/i)
    await userEvent.type(input, 'Ana')
    await userEvent.clear(input)
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
    expect(screen.getByText('Marko Marković')).toBeInTheDocument()
    expect(screen.getByText('Jovana Jović')).toBeInTheDocument()
  })
})
