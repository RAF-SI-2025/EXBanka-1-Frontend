import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { InternalTransferPage } from '@/pages/InternalTransferPage'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useTransfersHook from '@/hooks/useTransfers'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useTransfers')

describe('InternalTransferPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useTransfersHook.useExecuteTransfer).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
  })

  it('renders internal transfer form', () => {
    renderWithProviders(<InternalTransferPage />)
    expect(screen.getByText(/transfer funds/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })
})
