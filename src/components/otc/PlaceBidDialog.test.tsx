import { render, screen, fireEvent } from '@testing-library/react'
import { PlaceBidDialog } from '@/components/otc/PlaceBidDialog'
import { createMockOtcOptionOffer } from '@/__tests__/fixtures/otcOption-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

const listing = createMockOtcOptionOffer({
  id: 1001,
  ticker: 'AAPL',
  quantity: '50',
  strike_price: '180.00',
  premium: '500.00',
  settlement_date: '2026-06-05',
})
const accounts = [createMockAccount({ id: 4242, account_name: 'My RSD', currency_code: 'RSD' })]

function setup(props: Partial<React.ComponentProps<typeof PlaceBidDialog>> = {}) {
  const onSubmit = jest.fn()
  render(
    <PlaceBidDialog
      open
      onOpenChange={jest.fn()}
      listing={listing}
      accounts={accounts}
      onSubmit={onSubmit}
      loading={false}
      {...props}
    />
  )
  return { onSubmit }
}

describe('PlaceBidDialog', () => {
  it('does not render a settlement date field — it is inherited from the listing', () => {
    setup()
    expect(screen.queryByLabelText(/settlement/i)).not.toBeInTheDocument()
  })

  it('shows the listing\'s settlement date as read-only context', () => {
    setup()
    expect(screen.getByText(/2026-06-05/)).toBeInTheDocument()
  })

  it('submits the listing\'s settlement_date verbatim', () => {
    const { onSubmit } = setup()
    fireEvent.click(screen.getByRole('option', { name: /My RSD/ }))
    fireEvent.click(screen.getByRole('button', { name: /^place bid$/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        bidder_account_id: 4242,
        quantity: '50',
        strike_price: '180.00',
        premium: '500.00',
        settlement_date: '2026-06-05',
      })
    )
  })
})
