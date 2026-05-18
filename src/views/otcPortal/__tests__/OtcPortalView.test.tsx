import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcPortalView } from '@/views/otcPortal/OtcPortalView'
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

describe('OtcPortalView', () => {
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

    const anyVal = (v: unknown) => v as any
    jest
      .mocked(useOtcHook.useOtcOffers)
      .mockReturnValue(anyVal({ data: { offers, total_count: 1 }, isLoading: false }))
    jest
      .mocked(useOtcHook.useBuyOtcOffer)
      .mockReturnValue(anyVal({ mutate: buyMutateFn, isPending: false }))
    jest
      .mocked(useOtcHook.useBuyOtcOfferOnBehalf)
      .mockReturnValue(anyVal({ mutate: buyOnBehalfMutateFn, isPending: false }))
    jest
      .mocked(useOtcHook.useCreatePeerOtcNegotiation)
      .mockReturnValue(anyVal({ mutate: jest.fn(), isPending: false }))
    jest
      .mocked(useAccountsHook.useClientAccounts)
      .mockReturnValue(anyVal({ data: { accounts, total: 1 }, isLoading: false }))
    jest
      .mocked(useAccountsHook.useAccountsByClient)
      .mockReturnValue(anyVal({ data: { accounts, total: 1 }, isLoading: false }))
    jest.mocked(useClientsHook.useAllClients).mockReturnValue(
      anyVal({
        data: { clients: [createMockClient({ id: 5 })], total_count: 1 },
        isLoading: false,
      })
    )
  })

  it('renders the title inside the animated shell', () => {
    renderWithProviders(<OtcPortalView />, { preloadedState: clientAuth() })
    expect(screen.getByText(/otc trading portal/i)).toBeInTheDocument()
    expect(screen.getByTestId('view-shell')).toHaveClass('animate-in')
  })

  it('renders offers in the table', () => {
    renderWithProviders(<OtcPortalView />, { preloadedState: clientAuth() })
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('shows the loading state while fetching', () => {
    jest.mocked(useOtcHook.useOtcOffers).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    renderWithProviders(<OtcPortalView />, { preloadedState: clientAuth() })
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })

  it('opens BuyOtcDialog when a client clicks Buy', () => {
    renderWithProviders(<OtcPortalView />, { preloadedState: clientAuth() })
    fireEvent.click(screen.getByRole('button', { name: /buy/i }))
    expect(screen.getByText(/buy aapl/i)).toBeInTheDocument()
  })

  it('opens BuyOnBehalfOtcDialog when an employee clicks Buy', () => {
    renderWithProviders(<OtcPortalView />, { preloadedState: employeeAuth() })
    fireEvent.click(screen.getByRole('button', { name: /buy/i }))
    expect(screen.getByText(/buy aapl on behalf of client/i)).toBeInTheDocument()
  })

  it('disables useAllClients for client users (employee-only endpoint)', () => {
    renderWithProviders(<OtcPortalView />, { preloadedState: clientAuth() })
    expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ enabled: false })
    )
  })

  it('enables useAllClients for employee users', () => {
    renderWithProviders(<OtcPortalView />, { preloadedState: employeeAuth() })
    expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ enabled: true })
    )
  })
})
