import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { SecuritiesPage } from '@/pages/SecuritiesPage'
import * as useSecuritiesHook from '@/hooks/useSecurities'
import * as useOrdersHook from '@/hooks/useOrders'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useSecurities')
jest.mock('@/hooks/useOrders')
jest.mock('@/hooks/useAccounts')

describe('SecuritiesPage', () => {
  const stocks = [createMockStock({ id: 1, ticker: 'AAPL' })]
  const accounts = [createMockAccount({ id: 1 })]
  const mutateFn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .mocked(useSecuritiesHook.useStocks)
      .mockReturnValue({ data: { stocks, total_count: 1 }, isLoading: false } as any)
    jest
      .mocked(useOrdersHook.useCreateOrder)
      .mockReturnValue({ mutate: mutateFn, isPending: false } as any)
    jest
      .mocked(useAccountsHook.useTradingAccounts)
      .mockReturnValue({ data: { accounts, total: 1 }, isLoading: false } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<SecuritiesPage />)
    expect(screen.getByText(/securities/i)).toBeInTheDocument()
  })

  it('renders stocks in the table', () => {
    renderWithProviders(<SecuritiesPage />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest
      .mocked(useSecuritiesHook.useStocks)
      .mockReturnValue({ data: undefined, isLoading: true } as any)
    renderWithProviders(<SecuritiesPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('opens buy dialog when Buy is clicked', () => {
    renderWithProviders(<SecuritiesPage />)
    fireEvent.click(screen.getByRole('button', { name: /buy/i }))
    expect(screen.getByText(/buy aapl/i)).toBeInTheDocument()
  })
})
