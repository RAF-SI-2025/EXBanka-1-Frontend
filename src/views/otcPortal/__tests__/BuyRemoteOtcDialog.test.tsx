import { render, screen, fireEvent } from '@testing-library/react'
import { BuyRemoteOtcDialog } from '@/views/otcPortal/components/BuyRemoteOtcDialog'
import { createMockRemoteOtcOffer } from '@/__tests__/fixtures/otc-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

describe('BuyRemoteOtcDialog', () => {
  const offer = createMockRemoteOtcOffer({
    bank_code: '333',
    ticker: 'MSFT',
    quantity: 5,
    owner_id: '0',
    currency: 'USD',
  })
  const accounts = [createMockAccount({ id: 7, account_name: 'Main', currency_code: 'USD' })]

  function setup() {
    const onSubmit = jest.fn()
    const onOpenChange = jest.fn()
    render(
      <BuyRemoteOtcDialog
        open
        onOpenChange={onOpenChange}
        offer={offer}
        accounts={accounts}
        onSubmit={onSubmit}
        loading={false}
      />
    )
    return { onSubmit, onOpenChange }
  }

  it('renders header with ticker and seller bank', () => {
    setup()
    expect(screen.getByText(/bid on msft/i)).toBeInTheDocument()
    expect(screen.getByText(/bank 333/i)).toBeInTheDocument()
  })

  it('disables Submit until required fields are valid', () => {
    setup()
    expect(screen.getByRole('button', { name: /submit bid/i })).toBeDisabled()
  })

  it('builds the PlaceBidPayload from form inputs', () => {
    const { onSubmit } = setup()
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/strike price/i), { target: { value: '175.00' } })
    fireEvent.change(screen.getByLabelText(/premium/i), { target: { value: '40.00' } })
    fireEvent.change(screen.getByLabelText(/settlement date/i), { target: { value: '2027-08-01' } })
    fireEvent.click(screen.getByRole('button', { name: /submit bid/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      bidder_account_id: 7,
      quantity: '2',
      strike_price: '175.00',
      premium: '40.00',
      settlement_date: '2027-08-01',
    })
  })
})
