import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PortfolioView } from '@/views/portfolio/PortfolioView'
import * as portfolioApi from '@/lib/api/portfolio'
import * as useFundsHook from '@/hooks/useFunds'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as recurringOrdersApi from '@/lib/api/recurringOrders'
import {
  createMockPortfolioResponse,
  createMockSecurityPosition,
  createMockPortfolioSummary,
} from '@/__tests__/fixtures/portfolio-fixtures'
import { createMockClientFundPosition } from '@/__tests__/fixtures/fund-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/lib/api/portfolio')
jest.mock('@/hooks/useFunds')
jest.mock('@/hooks/useAccounts')
jest.mock('@/lib/api/recurringOrders')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockRedeemMutate = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(portfolioApi.getPortfolio).mockResolvedValue(
    createMockPortfolioResponse({
      securities: {
        total_value_rsd: '2200',
        total_profit_rsd: '200',
        total_profit_pct: '10',
        positions: [createMockSecurityPosition({ holding_id: 1, symbol: 'AAPL', quantity: 10 })],
      },
    })
  )
  jest.mocked(portfolioApi.getPortfolioSummary).mockResolvedValue(createMockPortfolioSummary())
  jest.mocked(portfolioApi.makeHoldingPublic).mockResolvedValue({ offer: { id: 1 } })
  jest.mocked(portfolioApi.exerciseOption).mockResolvedValue(createMockSecurityPosition())
  jest.mocked(useFundsHook.useMyFundPositions).mockReturnValue({
    data: { positions: [] },
    isLoading: false,
  } as any)
  jest.mocked(useFundsHook.useRedeemFund).mockReturnValue({
    mutate: mockRedeemMutate,
    isPending: false,
  } as any)
  jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
    data: { accounts: [createMockAccount()], total: 1 },
    isLoading: false,
  } as any)
  jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue({
    data: { accounts: [], total: 0 },
    isLoading: false,
  } as any)
  jest.mocked(recurringOrdersApi.getMyRecurringOrders).mockResolvedValue([
    {
      id: 1,
      listing_id: 7,
      side: 'buy',
      quantity: 10,
      account_id: 42,
      interval: 'monthly',
      day_of_month: 15,
      start_date_unix: 1731699200,
      end_date_unix: 0,
      status: 'active',
      created_at: '2026-05-30T00:00:00Z',
      updated_at: '2026-05-30T00:00:00Z',
    },
  ])
})

describe('PortfolioView', () => {
  it('renders page title', () => {
    renderWithProviders(<PortfolioView />)
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })

  it('displays positions on load', async () => {
    renderWithProviders(<PortfolioView />)
    await screen.findByText('AAPL')
  })

  it('displays summary card', async () => {
    renderWithProviders(<PortfolioView />)
    await screen.findByText('Unrealized P&L')
    expect(screen.getByText('1500.00')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest.mocked(portfolioApi.getPortfolio).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<PortfolioView />)
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    jest.mocked(portfolioApi.getPortfolio).mockResolvedValue(
      createMockPortfolioResponse({
        securities: {
          total_value_rsd: '0',
          total_profit_rsd: '0',
          total_profit_pct: '0',
          positions: [],
        },
      })
    )
    renderWithProviders(<PortfolioView />)
    await screen.findByText('No holdings found.')
  })

  it('shows recurring orders when the Recurring Orders tab is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioView />)

    await user.click(screen.getByRole('tab', { name: /recurring orders/i }))

    expect(await screen.findByText(/^Quantity$/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^pause$/i })).toBeInTheDocument()
  })

  it('navigates to sell order page when Sell clicked', async () => {
    renderWithProviders(<PortfolioView />)
    const sellBtn = await screen.findByRole('button', { name: /sell/i })
    fireEvent.click(sellBtn)
    expect(mockNavigate).toHaveBeenCalledWith(
      '/securities/order/new?direction=sell&securityType=stock&ticker=AAPL'
    )
  })

  it('navigates to holding transactions when row clicked', async () => {
    renderWithProviders(<PortfolioView />)
    await screen.findByText('AAPL')
    fireEvent.click(screen.getByText('AAPL'))
    expect(mockNavigate).toHaveBeenCalledWith('/portfolio/holdings/1/transactions')
  })

  it('opens MakePublicDialog with quantity input when Make Public clicked', async () => {
    renderWithProviders(<PortfolioView />)
    const makePublicBtn = await screen.findByRole('button', { name: /make public/i })
    fireEvent.click(makePublicBtn)
    expect(await screen.findByText(/make shares public.*aapl/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity to make public/i)).toBeInTheDocument()
    expect(portfolioApi.makeHoldingPublic).not.toHaveBeenCalled()
  })

  it('submits make-public mutation with the position holding_id and entered quantity', async () => {
    renderWithProviders(<PortfolioView />)
    fireEvent.click(await screen.findByRole('button', { name: /make public/i }))
    fireEvent.change(await screen.findByLabelText(/quantity to make public/i), {
      target: { value: '7' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: /make public/i }).at(-1)!)
    await waitFor(() => {
      expect(portfolioApi.makeHoldingPublic).toHaveBeenCalledWith(1, { quantity: 7 })
    })
  })

  it('opens the Redeem dialog when the Redeem button is clicked on a fund position', async () => {
    jest.mocked(useFundsHook.useMyFundPositions).mockReturnValue({
      data: {
        positions: [createMockClientFundPosition({ fund_id: 101, fund_name: 'Alpha Growth Fund' })],
      },
      isLoading: false,
    } as any)

    renderWithProviders(<PortfolioView />, { route: '/portfolio?tab=funds' })

    await userEvent.click(await screen.findByRole('button', { name: /redeem/i }))

    expect(
      await screen.findByRole('heading', { name: /redeem from alpha growth fund/i })
    ).toBeInTheDocument()
  })

  it('uses bank accounts (not client accounts) in the Redeem dialog when the user is an employee', async () => {
    jest.mocked(useFundsHook.useMyFundPositions).mockReturnValue({
      data: {
        positions: [createMockClientFundPosition({ fund_id: 101, fund_name: 'Alpha Growth Fund' })],
      },
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [createMockAccount({ id: 1, account_name: 'Client Acct' })], total: 1 },
      isLoading: false,
    } as any)
    jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue({
      data: { accounts: [createMockAccount({ id: 99, account_name: 'Bank Op' })], total: 1 },
      isLoading: false,
    } as any)

    renderWithProviders(<PortfolioView />, {
      route: '/portfolio?tab=funds',
      preloadedState: { auth: { userType: 'employee' } as any },
    })

    await userEvent.click(await screen.findByRole('button', { name: /redeem/i }))

    // Open the Target account dropdown
    await userEvent.click(await screen.findByRole('combobox', { name: /Target account/i }))
    // Bank account shows, client account does not
    expect(await screen.findByText(/Bank Op/)).toBeInTheDocument()
    expect(screen.queryByText(/Client Acct/)).not.toBeInTheDocument()
  })
})
