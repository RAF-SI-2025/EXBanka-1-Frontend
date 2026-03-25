import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardItem } from '@/components/cards/CardItem'
import { createMockCard } from '@/__tests__/fixtures/card-fixtures'

describe('CardItem', () => {
  const onBlock = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders masked card number', () => {
    const card = createMockCard({ card_number: '4111111111111111' })
    renderWithProviders(<CardItem card={card} onBlock={onBlock} />)
    expect(screen.getByText('4111 **** **** 1111')).toBeInTheDocument()
  })

  it('shows account info', () => {
    const card = createMockCard({ account_number: '111000100000000011' })
    renderWithProviders(<CardItem card={card} onBlock={onBlock} accountName="Main RSD" />)
    expect(screen.getByText(/main rsd/i)).toBeInTheDocument()
  })

  it('shows status badge', () => {
    const card = createMockCard({ status: 'ACTIVE' })
    renderWithProviders(<CardItem card={card} onBlock={onBlock} />)
    expect(screen.getByText(/active/i)).toBeInTheDocument()
  })

  it('shows block button for active cards', () => {
    const card = createMockCard({ status: 'ACTIVE' })
    renderWithProviders(<CardItem card={card} onBlock={onBlock} />)
    expect(screen.getByText(/^block$/i)).toBeInTheDocument()
  })

  it('hides block button for blocked cards', () => {
    const card = createMockCard({ status: 'BLOCKED' })
    renderWithProviders(<CardItem card={card} onBlock={onBlock} />)
    expect(screen.queryByText(/^block$/i)).not.toBeInTheDocument()
  })

  it('calls onBlock', async () => {
    const user = userEvent.setup()
    const card = createMockCard({ id: 5, status: 'ACTIVE' })
    renderWithProviders(<CardItem card={card} onBlock={onBlock} />)
    await user.click(screen.getByText(/^block$/i))
    expect(onBlock).toHaveBeenCalledWith(5)
  })
})
