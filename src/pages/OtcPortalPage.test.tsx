import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcPortalPage } from '@/pages/OtcPortalPage'
import * as useOtcHook from '@/hooks/useOtc'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useClientsHook from '@/hooks/useClients'
import { createMockOtcOffer } from '@/__tests__/fixtures/otc-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'
import { createMockAuthState, createMockAuthUser } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/hooks/useOtc')
jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useClients')
jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

describe('OtcPortalPage', () => {
  const offers = [createMockOtcOffer({ id: 1, ticker: 'AAPL' })]
  const accounts = [createMockAccount({ id: 1 })]
  const buyMutateFn = jest.fn()
  const buyOnBehalfMutateFn = jest.fn()

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
    jest
      .mocked(useOtcHook.useOtcOffers)
      .mockReturnValue({ data: { offers, total_count: 1 }, isLoading: false } as any)
    jest
      .mocked(useOtcHook.useBuyOtcOffer)
      .mockReturnValue({ mutate: buyMutateFn, isPending: false } as any)
    jest
      .mocked(useOtcHook.useBuyOtcOfferOnBehalf)
      .mockReturnValue({ mutate: buyOnBehalfMutateFn, isPending: false } as any)
    jest
      .mocked(useAccountsHook.useClientAccounts)
      .mockReturnValue({ data: { accounts, total: 1 }, isLoading: false } as any)
    jest
      .mocked(useAccountsHook.useAccountsByClient)
      .mockReturnValue({ data: { accounts, total: 1 }, isLoading: false } as any)
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [createMockClient({ id: 5 })], total_count: 1 },
      isLoading: false,
    } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<OtcPortalPage />, { preloadedState: clientAuth() })
    expect(screen.getByText(/otc trading portal/i)).toBeInTheDocument()
  })

  it('renders offers in the table', () => {
    renderWithProviders(<OtcPortalPage />, { preloadedState: clientAuth() })
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('shows LoadingSpinner while fetching', () => {
    jest
      .mocked(useOtcHook.useOtcOffers)
      .mockReturnValue({ data: undefined, isLoading: true } as any)
    renderWithProviders(<OtcPortalPage />, { preloadedState: clientAuth() })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('opens BuyOtcDialog when a client clicks Buy', () => {
    renderWithProviders(<OtcPortalPage />, { preloadedState: clientAuth() })
    fireEvent.click(screen.getByRole('button', { name: /buy/i }))
    expect(screen.getByText(/buy aapl/i)).toBeInTheDocument()
  })

  it('opens BuyOnBehalfOtcDialog when an employee clicks Buy', () => {
    renderWithProviders(<OtcPortalPage />, { preloadedState: employeeAuth() })
    fireEvent.click(screen.getByRole('button', { name: /buy/i }))
    expect(screen.getByText(/buy aapl on behalf of client/i)).toBeInTheDocument()
  })
})
