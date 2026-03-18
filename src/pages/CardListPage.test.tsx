import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardListPage } from '@/pages/CardListPage'
import * as useCardsHook from '@/hooks/useCards'

jest.mock('@/hooks/useCards')

describe('CardListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useCardsHook.useCards).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useBlockCard).mockReturnValue({
      mutate: jest.fn(),
    } as any)
  })

  it('renders card list with request button', () => {
    renderWithProviders(<CardListPage />)
    expect(screen.getByRole('heading', { name: /kartice/i })).toBeInTheDocument()
    expect(screen.getByText(/zatraži karticu/i)).toBeInTheDocument()
  })
})
