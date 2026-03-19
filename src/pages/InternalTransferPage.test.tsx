import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { InternalTransferPage } from '@/pages/InternalTransferPage'
import * as useAccountsHook from '@/hooks/useAccounts'

jest.mock('@/hooks/useAccounts')

describe('InternalTransferPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
  })

  it('renders internal transfer form', () => {
    renderWithProviders(<InternalTransferPage />)
    expect(screen.getByText(/prenos sredstava/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/iznos/i)).toBeInTheDocument()
  })
})
