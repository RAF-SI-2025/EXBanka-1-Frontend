import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransferHistoryPage } from '@/pages/TransferHistoryPage'
import * as useTransfersHook from '@/hooks/useTransfers'

jest.mock('@/hooks/useTransfers')

describe('TransferHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useTransfersHook.useTransfers).mockReturnValue({
      data: { transfers: [], total: 0 },
      isLoading: false,
    } as any)
  })

  it('renders history page title', () => {
    renderWithProviders(<TransferHistoryPage />)
    expect(screen.getByText(/istorija transfera/i)).toBeInTheDocument()
  })
})
