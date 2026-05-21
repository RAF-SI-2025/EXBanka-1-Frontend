import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PortfolioView } from '@/views/portfolio/PortfolioView'
import * as portfolioApi from '@/lib/api/portfolio'
import * as useFundsHook from '@/hooks/useFunds'
import * as useAccountsHook from '@/hooks/useAccounts'
import {
  createMockHolding,
  createMockPortfolioSummary,
} from '@/__tests__/fixtures/portfolio-fixtures'
import { createMockClientFundPosition } from '@/__tests__/fixtures/fund-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/lib/api/portfolio')
jest.mock('@/hooks/useFunds')
jest.mock('@/hooks/useAccounts')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockRedeemMutate = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(portfolioApi.getPortfolio).mockResolvedValue({
    holdings: [createMockHolding({ id: 1, ticker: 'AAPL', quantity: 10, public_quantity: 0 })],
    total_count: 1,
  })
  jest.mocked(portfolioApi.getPortfolioSummary).mockResolvedValue(createMockPortfolioSummary())
  jest.mocked(portfolioApi.makeHoldingPublic).mockResolvedValue({ offer: { id: 1 } })
  jest.mocked(portfolioApi.exerciseOption).mockResolvedValue(createMockHolding())
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
})

describe('PortfolioView', () => {
  it('renders page title', () => {
    renderWithProviders(<PortfolioView />)
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })

  it('displays holdings on load', async () => {
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
    jest.mocked(portfolioApi.getPortfolio).mockResolvedValue({ holdings: [], total_count: 0 })
    renderWithProviders(<PortfolioView />)
    await screen.findByText('No holdings found.')
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

  it('submits make-public mutation with the quantity entered in the dialog', async () => {
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
})
