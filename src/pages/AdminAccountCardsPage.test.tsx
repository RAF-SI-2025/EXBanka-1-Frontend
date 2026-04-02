import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    jest
      .mocked(useCardsHook.useBlockCard)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
    jest
      .mocked(useCardsHook.useUnblockCard)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
    jest
      .mocked(useCardsHook.useDeactivateCard)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  })

  it('renders card management page', () => {
    renderWithProviders(<AdminAccountCardsPage />, { route: '/admin/accounts/1/cards' })
    expect(screen.getByText(/cards/i)).toBeInTheDocument()
    expect(screen.getByText('4111 **** **** 1111')).toBeInTheDocument()
  })

  it('shows confirmation dialog before blocking a card', async () => {
    renderWithProviders(<AdminAccountCardsPage />, { route: '/admin/accounts/1/cards' })
    await userEvent.click(screen.getByText('Block'))
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('shows confirmation dialog before deactivating a card', async () => {
    jest.mocked(useCardsHook.useAccountCards).mockReturnValue({
      data: [createMockCard({ status: 'BLOCKED' })],
      isLoading: false,
    } as any)
    renderWithProviders(<AdminAccountCardsPage />, { route: '/admin/accounts/1/cards' })
    // Click the Deactivate button in the card item (not the dialog confirm button)
    const deactivateButtons = screen.getAllByText('Deactivate')
    await userEvent.click(deactivateButtons[0])
    expect(screen.getByRole('heading', { name: /permanently deactivate/i })).toBeInTheDocument()
  })
})
