import { screen, fireEvent, waitFor } from '@testing-library/react'
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
    expect(screen.getByText(/transfer history/i)).toBeInTheDocument()
  })

  it('calls useTransfers with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<TransferHistoryPage />)
    expect(useTransfersHook.useTransfers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<TransferHistoryPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useTransfersHook.useTransfers).mockReturnValue({
      data: { transfers: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<TransferHistoryPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls useTransfers with page 2 when next arrow is clicked', async () => {
    jest.mocked(useTransfersHook.useTransfers).mockReturnValue({
      data: { transfers: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<TransferHistoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useTransfersHook.useTransfers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })
})
