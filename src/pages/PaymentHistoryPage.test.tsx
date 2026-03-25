import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PaymentHistoryPage } from '@/pages/PaymentHistoryPage'
import * as usePaymentsHook from '@/hooks/usePayments'
import * as useAccountsHook from '@/hooks/useAccounts'

jest.mock('@/hooks/usePayments')
jest.mock('@/hooks/useAccounts')
jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

describe('PaymentHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 0 },
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
  })

  it('renders payment history page', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByText(/payment history/i)).toBeInTheDocument()
  })

  it('calls usePayments with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls usePayments with page 2 when next arrow is clicked', async () => {
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })

  it('resets to page 1 when selected account changes', async () => {
    const mockAccount = { account_number: 'ACC-001', account_name: 'Checking' }
    const mockAccount2 = { account_number: 'ACC-002', account_name: 'Savings' }
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [mockAccount, mockAccount2], total: 2 },
      isLoading: false,
    } as any)
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    )

    const accountSelect = screen.getByRole('combobox')
    fireEvent.change(accountSelect, { target: { value: 'ACC-002' } })

    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    )
  })

  it('resets to page 1 when filter changes', async () => {
    jest.mocked(usePaymentsHook.usePayments).mockReturnValue({
      data: { payments: [], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<PaymentHistoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    )

    const dateInput = screen.getByPlaceholderText(/from date/i)
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } })

    await waitFor(() =>
      expect(usePaymentsHook.usePayments).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, date_from: '2024-01-01' })
      )
    )
  })
})
