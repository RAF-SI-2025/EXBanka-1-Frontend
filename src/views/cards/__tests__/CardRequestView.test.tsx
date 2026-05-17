import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardRequestView } from '@/views/cards/CardRequestView'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useCardsHook from '@/hooks/useCards'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useCards')

describe('CardRequestView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: { accounts: [], total: 0 },
      isLoading: false,
    } as any)
    jest
      .mocked(useCardsHook.useRequestCard)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
    jest
      .mocked(useCardsHook.useRequestCardForAuthorizedPerson)
      .mockReturnValue({ mutate: jest.fn(), isPending: false } as any)
  })

  it('renders card request form', () => {
    renderWithProviders(<CardRequestView />)
    expect(screen.getByText(/request new card/i)).toBeInTheDocument()
  })
})
