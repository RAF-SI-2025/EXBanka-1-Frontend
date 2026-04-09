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
            account_name: 'RSD',
            currency_code: 'RSD',
            available_balance: 50000,
          },
          {
            id: 2,
            account_number: '111000100000000022',
            account_name: 'EUR',
            currency_code: 'EUR',
            available_balance: 500,
          },
        ],
        total: 2,
      },
      isLoading: false,
    } as any)
    jest.mocked(useTransfersHook.useTransferPreview).mockReturnValue({
      data: undefined,
      isSuccess: false,
    } as any)
    jest.mocked(useTransfersHook.useExecuteTransfer).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
  })

  it('renders transfer form initially', () => {
    renderWithProviders(<CreateTransferPage />)
    expect(screen.getByText(/create transfer/i)).toBeInTheDocument()
  })

  it('shows loading when accounts load', () => {
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    renderWithProviders(<CreateTransferPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders verification step after transfer submission', () => {
    renderWithProviders(<CreateTransferPage />, {
      preloadedState: {
        auth: {
          user: {
            id: 1,
            email: 'test@test.com',
            role: 'USER',
            permissions: [],
            system_type: 'client',
          },
          userType: 'client',
          accessToken: 'token',
          refreshToken: 'refresh',
          status: 'authenticated',
          error: null,
        },
        transfer: {
          step: 'verification',
          formData: {
            from_account_number: '111000100000000011',
            to_account_number: '111000100000000022',
            amount: 100,
          },
          preview: null,
          submitting: false,
          error: null,
          result: null,
          transactionId: 42,
          challengeId: null,
          codeRequested: false,
          verificationError: null,
        },
      },
    })
    expect(screen.getAllByText(/verification/i).length).toBeGreaterThan(0)
  })
})
