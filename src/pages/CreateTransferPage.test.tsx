import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateTransferPage } from '@/pages/CreateTransferPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useTransfersHook from '@/hooks/useTransfers'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useTransfers')

describe('CreateTransferPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: {
        accounts: [
          {
            id: 1,
            account_number: '111000100000000011',
            name: 'RSD',
            currency: 'RSD',
            available_balance: 50000,
          },
          {
            id: 2,
            account_number: '111000100000000022',
            name: 'EUR',
            currency: 'EUR',
            available_balance: 500,
          },
        ],
        total_count: 2,
      },
      isLoading: false,
    } as any)
    jest.mocked(useTransfersHook.useTransferPreview).mockReturnValue({
      data: undefined,
      isSuccess: false,
    } as any)
  })

  it('renders transfer form initially', () => {
    renderWithProviders(<CreateTransferPage />)
    expect(screen.getByText(/kreiraj transfer/i)).toBeInTheDocument()
  })

  it('shows loading when accounts load', () => {
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    renderWithProviders(<CreateTransferPage />)
    expect(screen.getByText(/učitavanje/i)).toBeInTheDocument()
  })
})
