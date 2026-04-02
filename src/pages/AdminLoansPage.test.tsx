import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminLoansPage } from '@/pages/AdminLoansPage'
import * as useLoansHook from '@/hooks/useLoans'
import { createMockLoan } from '@/__tests__/fixtures/loan-fixtures'

jest.mock('@/hooks/useLoans')

describe('AdminLoansPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useLoansHook.useAllLoans).mockReturnValue({
      data: { loans: [createMockLoan()], total: 1 },
      isLoading: false,
    } as any)
  })

  it('renders all loans page', () => {
    renderWithProviders(<AdminLoansPage />)
    expect(screen.getByText(/all loans/i)).toBeInTheDocument()
    expect(screen.getByText('LN-2026-00001')).toBeInTheDocument()
  })

  it('calls useAllLoans with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminLoansPage />)
    expect(useLoansHook.useAllLoans).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminLoansPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useLoansHook.useAllLoans).mockReturnValue({
      data: { loans: [createMockLoan()], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoansPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls useAllLoans with page 2 when next arrow is clicked', async () => {
    jest.mocked(useLoansHook.useAllLoans).mockReturnValue({
      data: { loans: [createMockLoan()], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoansPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useLoansHook.useAllLoans).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })

  it('resets to page 1 when filter changes', async () => {
    jest.mocked(useLoansHook.useAllLoans).mockReturnValue({
      data: { loans: [createMockLoan()], total: 11 },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminLoansPage />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useLoansHook.useAllLoans).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    )

    const accountInput = screen.getByPlaceholderText(/account number/i)
    fireEvent.change(accountInput, { target: { value: '123' } })

    await waitFor(() =>
      expect(useLoansHook.useAllLoans).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, account_number: '123' })
      )
    )
  })
})
