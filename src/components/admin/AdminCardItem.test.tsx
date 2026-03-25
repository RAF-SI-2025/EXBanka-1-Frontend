import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminCardItem } from '@/components/admin/AdminCardItem'
import { createMockCard } from '@/__tests__/fixtures/card-fixtures'
import { maskCardNumber } from '@/lib/utils/format'

describe('AdminCardItem', () => {
  const onBlock = jest.fn()
  const onUnblock = jest.fn()
  const onDeactivate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders masked card number', () => {
    const card = createMockCard({ card_number: '4111111111111111' })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    expect(screen.getByText(maskCardNumber('4111111111111111'))).toBeInTheDocument()
  })

  it('ACTIVE status: shows Block button, no Unblock or Deactivate', () => {
    const card = createMockCard({ status: 'ACTIVE' })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    expect(screen.getByRole('button', { name: /^block$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /unblock/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /deactivate/i })).not.toBeInTheDocument()
  })

  it('BLOCKED status: shows Unblock and Deactivate buttons, no Block', () => {
    const card = createMockCard({ status: 'BLOCKED' })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    expect(screen.getByRole('button', { name: /unblock/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^block$/i })).not.toBeInTheDocument()
  })

  it('DEACTIVATED status: no action buttons', () => {
    const card = createMockCard({ status: 'DEACTIVATED' })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    expect(screen.queryByRole('button', { name: /^block$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /unblock/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /deactivate/i })).not.toBeInTheDocument()
  })

  it('calls onBlock when Block is clicked', () => {
    const card = createMockCard({ status: 'ACTIVE', id: 42 })
    renderWithProviders(
      <AdminCardItem
        card={card}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDeactivate={onDeactivate}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /^block$/i }))
    expect(onBlock).toHaveBeenCalledWith(42)
  })
})
