import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PortfolioPage } from '@/pages/PortfolioPage'
import * as usePortfolioHook from '@/hooks/usePortfolio'
import * as useOrdersHook from '@/hooks/useOrders'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockHolding } from '@/__tests__/fixtures/portfolio-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/usePortfolio')
jest.mock('@/hooks/useOrders')
jest.mock('@/hooks/useAccounts')

describe('PortfolioPage', () => {
  const holdings = [createMockHolding({ id: 1, ticker: 'AAPL', quantity: 10 })]
  const accounts = [createMockAccount({ id: 1 })]
  const mutateFn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .mocked(usePortfolioHook.usePortfolio)
      .mockReturnValue({ data: { holdings, total_count: 1 }, isLoading: false } as any)
    jest
      .mocked(usePortfolioHook.usePortfolioSummary)
      .mockReturnValue({
        data: { total_value: '1750.00', total_profit_loss: '250.00' },
        isLoading: false,
      } as any)
    jest
      .mocked(useOrdersHook.useCreateOrder)
      .mockReturnValue({ mutate: mutateFn, isPending: false } as any)
    jest
      .mocked(useAccountsHook.useTradingAccounts)
      .mockReturnValue({ data: { accounts, total: 1 }, isLoading: false } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<PortfolioPage />)
    expect(screen.getByText(/portfolio/i)).toBeInTheDocument()
  })

  it('renders holdings in the table', () => {
    renderWithProviders(<PortfolioPage />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest
      .mocked(usePortfolioHook.usePortfolio)
      .mockReturnValue({ data: undefined, isLoading: true } as any)
    renderWithProviders(<PortfolioPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('opens sell dialog when Sell is clicked', () => {
    renderWithProviders(<PortfolioPage />)
    fireEvent.click(screen.getByRole('button', { name: /sell/i }))
    expect(screen.getByText(/sell aapl/i)).toBeInTheDocument()
  })
})
