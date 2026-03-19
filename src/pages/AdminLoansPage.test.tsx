import { screen } from '@testing-library/react'
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
    expect(screen.getByText(/svi krediti/i)).toBeInTheDocument()
    expect(screen.getByText('LN-2026-00001')).toBeInTheDocument()
  })
})
