import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcOffersPage } from '@/pages/OtcOffersPage'
import * as useOtcOptionsHook from '@/hooks/useOtcOptions'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as usePortfolioHook from '@/hooks/usePortfolio'
import { createMockOtcOptionOffer } from '@/__tests__/fixtures/otcOption-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/hooks/useOtcOptions')
jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/usePortfolio')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const clientAccount = createMockAccount({ id: 11, account_name: 'My RSD' })
const bankAccount = createMockAccount({
  id: 99,
  account_name: 'EX Banka RSD',
  account_type: 'bank',
})
// Distinguishable by ticker so we can assert exactly one set is on screen.
const allOffer = createMockOtcOptionOffer({ id: 1001, ticker: 'AAPL-ALL', stock_id: 1 })
const meOffer = createMockOtcOptionOffer({ id: 2002, ticker: 'TSLA-ME', stock_id: 2 })

function clientAuth() {
  return {
    auth: createMockAuthState({
      userType: 'client',
      user: createMockAuthUser({ role: 'Client', system_type: 'client' }),
    }),
  }
}

function employeeAuth() {
  return {
    auth: createMockAuthState({
      userType: 'employee',
      user: createMockAuthUser({ role: 'EmployeeAgent' }),
    }),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockNavigate.mockClear()
  jest.mocked(useOtcOptionsHook.useAllOtcOptionOffers).mockReturnValue({
    data: { offers: [allOffer], total: 1 },
    isLoading: false,
  } as any)
  jest.mocked(useOtcOptionsHook.useMyOtcOptionOffers).mockReturnValue({
    data: { offers: [meOffer], total: 1 },
    isLoading: false,
  } as any)
  jest.mocked(useOtcOptionsHook.useCreateOtcOptionOffer).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  } as any)
  jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
    data: { accounts: [clientAccount], total: 1 },
  } as any)
  jest.mocked(useAccountsHook.useBankAccounts).mockReturnValue({
    data: { accounts: [bankAccount], total: 1 },
  } as any)
  jest.mocked(usePortfolioHook.usePortfolio).mockReturnValue({
    data: { holdings: [], total_count: 0 },
  } as any)
})

describe('OtcOffersPage', () => {
  describe('tabs', () => {
    it('shows only two tabs: All and Me', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      expect(screen.getByRole('tab', { name: /^all$/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /^me$/i })).toBeInTheDocument()
      expect(screen.queryByRole('tab', { name: /as initiator/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('tab', { name: /as counterparty/i })).not.toBeInTheDocument()
    })

    it('defaults to the All tab', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('All tab → /otc/offers', () => {
    it('calls useAllOtcOptionOffers when on the All tab', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      expect(useOtcOptionsHook.useAllOtcOptionOffers).toHaveBeenCalled()
    })

    it('renders option offers from the All endpoint by default', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      expect(screen.getByText('AAPL-ALL')).toBeInTheDocument()
    })

    it('does not render Me-only offers on the All tab', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      expect(screen.queryByText('TSLA-ME')).not.toBeInTheDocument()
    })
  })

  describe('Me tab → /me/otc/offers', () => {
    it('switches to the Me-only listing when the Me tab is clicked', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      fireEvent.click(screen.getByRole('tab', { name: /^me$/i }))
      expect(useOtcOptionsHook.useMyOtcOptionOffers).toHaveBeenCalled()
    })

    it('renders only the Me listing when the Me tab is active', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      fireEvent.click(screen.getByRole('tab', { name: /^me$/i }))
      expect(screen.getByText('TSLA-ME')).toBeInTheDocument()
      expect(screen.queryByText('AAPL-ALL')).not.toBeInTheDocument()
    })
  })

  describe('toggling between tabs does not mix datasets', () => {
    it('All → Me → All swaps the visible rows cleanly each step', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })

      // start on All
      expect(screen.getByText('AAPL-ALL')).toBeInTheDocument()
      expect(screen.queryByText('TSLA-ME')).not.toBeInTheDocument()

      // → Me
      fireEvent.click(screen.getByRole('tab', { name: /^me$/i }))
      expect(screen.getByText('TSLA-ME')).toBeInTheDocument()
      expect(screen.queryByText('AAPL-ALL')).not.toBeInTheDocument()

      // → All again
      fireEvent.click(screen.getByRole('tab', { name: /^all$/i }))
      expect(screen.getByText('AAPL-ALL')).toBeInTheDocument()
      expect(screen.queryByText('TSLA-ME')).not.toBeInTheDocument()
    })

    it('All tab shows exactly the All listings count, not Me + All', () => {
      jest.mocked(useOtcOptionsHook.useAllOtcOptionOffers).mockReturnValue({
        data: {
          offers: [
            createMockOtcOptionOffer({ id: 100, ticker: 'A' }),
            createMockOtcOptionOffer({ id: 101, ticker: 'B' }),
            createMockOtcOptionOffer({ id: 102, ticker: 'C' }),
          ],
          total: 3,
        },
        isLoading: false,
      } as any)
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      // Three All offers, zero Me offers visible.
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.queryByText('TSLA-ME')).not.toBeInTheDocument()
    })
  })

  describe('public market section (removed)', () => {
    it('does not render a Public market section', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      expect(screen.queryByText(/public market/i)).not.toBeInTheDocument()
    })
  })

  describe('account dropdown source for create dialog', () => {
    it('uses client accounts for client users', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: clientAuth() })
      fireEvent.click(screen.getByRole('button', { name: /new offer/i }))
      expect(useAccountsHook.useClientAccounts).toHaveBeenCalled()
    })

    it('uses bank accounts for employee users', () => {
      renderWithProviders(<OtcOffersPage />, { preloadedState: employeeAuth() })
      fireEvent.click(screen.getByRole('button', { name: /new offer/i }))
      expect(useAccountsHook.useBankAccounts).toHaveBeenCalled()
    })
  })
})
