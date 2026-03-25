import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardListPage } from '@/pages/CardListPage'
import * as useCardsHook from '@/hooks/useCards'
import { createMockCard } from '@/__tests__/fixtures/card-fixtures'

jest.mock('@/hooks/useCards')

describe('CardListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useCardsHook.useCards).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)
    jest.mocked(useCardsHook.useBlockCard).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any)
  })

  it('renders card list with request button', () => {
    renderWithProviders(<CardListPage />)
    expect(screen.getByRole('heading', { name: /cards/i })).toBeInTheDocument()
    expect(screen.getByText(/request card/i)).toBeInTheDocument()
  })

  it('shows error state when loading fails', () => {
    jest.mocked(useCardsHook.useCards).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
    } as any)
    renderWithProviders(<CardListPage />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('shows confirmation dialog before blocking a card', async () => {
    jest.mocked(useCardsHook.useCards).mockReturnValue({
      data: [createMockCard({ status: 'ACTIVE' })],
      isLoading: false,
      error: null,
    } as any)
    renderWithProviders(<CardListPage />)
    const blockButton = screen.getByText('Block')
    await userEvent.click(blockButton)
    expect(screen.getByText('Block Card?')).toBeInTheDocument()
  })
})
