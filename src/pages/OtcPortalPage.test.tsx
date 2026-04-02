import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OtcPortalPage } from '@/pages/OtcPortalPage'
import * as useOtcHook from '@/hooks/useOtc'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockOtcOffer } from '@/__tests__/fixtures/otc-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useOtc')
jest.mock('@/hooks/useAccounts')

describe('OtcPortalPage', () => {
  const offers = [createMockOtcOffer({ id: 1, ticker: 'AAPL' })]
  const accounts = [createMockAccount({ id: 1 })]
  const buyMutateFn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .mocked(useOtcHook.useOtcOffers)
      .mockReturnValue({ data: { offers, total_count: 1 }, isLoading: false } as any)
    jest
      .mocked(useOtcHook.useBuyOtcOffer)
      .mockReturnValue({ mutate: buyMutateFn, isPending: false } as any)
    jest
      .mocked(useAccountsHook.useClientAccounts)
      .mockReturnValue({ data: { accounts, total: 1 }, isLoading: false } as any)
  })

  it('renders page heading', () => {
    renderWithProviders(<OtcPortalPage />)
    expect(screen.getByText(/otc/i)).toBeInTheDocument()
  })

  it('renders offers in the table', () => {
    renderWithProviders(<OtcPortalPage />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    jest
      .mocked(useOtcHook.useOtcOffers)
      .mockReturnValue({ data: undefined, isLoading: true } as any)
    renderWithProviders(<OtcPortalPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('opens buy dialog when Buy is clicked', () => {
    renderWithProviders(<OtcPortalPage />)
    fireEvent.click(screen.getByRole('button', { name: /buy/i }))
    expect(screen.getByText(/buy aapl/i)).toBeInTheDocument()
  })
})
