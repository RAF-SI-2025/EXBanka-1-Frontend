import { render, screen, fireEvent } from '@testing-library/react'
import { BuyRemoteOtcDialog } from '@/components/otc/BuyRemoteOtcDialog'
import { createMockRemoteOtcOffer } from '@/__tests__/fixtures/otc-fixtures'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

describe('BuyRemoteOtcDialog', () => {
  const offer = createMockRemoteOtcOffer({
    bank_code: '333',
    ticker: 'MSFT',
    quantity: 5,
    owner_id: '0',
    currency: 'USD',
  })

  function setup() {
    const onSubmit = jest.fn()
    const onOpenChange = jest.fn()
    render(
      <BuyRemoteOtcDialog
        open
        onOpenChange={onOpenChange}
        offer={offer}
        onSubmit={onSubmit}
        loading={false}
      />
    )
    return { onSubmit, onOpenChange }
  }

  it('renders header with ticker and seller bank', () => {
    setup()
    expect(screen.getByText(/negotiate msft with bank 333/i)).toBeInTheDocument()
  })

  it('disables Submit until required fields are valid', () => {
    setup()
    expect(screen.getByRole('button', { name: /submit negotiation/i })).toBeDisabled()
  })

  it('builds the negotiation payload from form inputs', () => {
    const { onSubmit } = setup()
    fireEvent.change(screen.getByLabelText(/^amount$/i), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/settlement date/i), {
      target: { value: '2027-08-01' },
    })
    fireEvent.change(screen.getByLabelText(/price per unit/i), {
      target: { value: '175' },
    })
    fireEvent.change(screen.getByLabelText(/^premium$/i), { target: { value: '40' } })
    fireEvent.click(screen.getByRole('button', { name: /submit negotiation/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      seller_bank_code: '333',
      seller_id: '0',
      stock: { ticker: 'MSFT' },
      amount: 2,
      settlement_date: new Date('2027-08-01').toISOString(),
      price_per_unit: { amount: '175', currency: 'USD' },
      premium: { amount: '40', currency: 'USD' },
    })
  })
})
