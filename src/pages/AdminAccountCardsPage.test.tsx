import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminAccountCardsPage } from '@/pages/AdminAccountCardsPage'
import * as useCardsHook from '@/hooks/useCards'
import * as useAccountsHook from '@/hooks/useAccounts'
import { createMockCard } from '@/__tests__/fixtures/card-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/hooks/useCards')
jest.mock('@/hooks/useAccounts')

describe('AdminAccountCardsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useAccount).mockReturnValue({
      data: createMockAccount(),
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useAccountCards).mockReturnValue({
      data: [createMockCard()],
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useBlockCard).mockReturnValue({ mutate: jest.fn() } as any)
    jest.mocked(useCardsHook.useUnblockCard).mockReturnValue({ mutate: jest.fn() } as any)
    jest.mocked(useCardsHook.useDeactivateCard).mockReturnValue({ mutate: jest.fn() } as any)
  })

  it('renders card management page', () => {
    renderWithProviders(<AdminAccountCardsPage />, { route: '/admin/accounts/1/cards' })
    expect(screen.getByText(/kartice/i)).toBeInTheDocument()
    expect(screen.getByText('4111********1111')).toBeInTheDocument()
  })
})
