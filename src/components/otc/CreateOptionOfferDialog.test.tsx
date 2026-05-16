import { render, screen, fireEvent } from '@testing-library/react'
import { CreateOptionOfferDialog } from '@/components/otc/CreateOptionOfferDialog'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import type { Holding } from '@/types/portfolio'
import type { Account } from '@/types/account'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

const holdings: Holding[] = [
  {
    id: 1,
    security_type: 'stock',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 50,
    public_quantity: 0,
    account_id: 1,
    last_modified: '2026-04-01T00:00:00Z',
  },
  {
    id: 2,
    security_type: 'stock',
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    quantity: 20,
    public_quantity: 0,
    account_id: 1,
    last_modified: '2026-04-01T00:00:00Z',
  },
  {
    id: 3,
    security_type: 'option',
    ticker: 'AAPL-OPT',
    name: 'Apple option',
    quantity: 1,
    public_quantity: 0,
    account_id: 1,
    last_modified: '2026-04-01T00:00:00Z',
  },
]
const accounts: Account[] = [
  createMockAccount({ id: 4242, account_name: 'My RSD', currency_code: 'RSD' }),
  createMockAccount({ id: 4343, account_name: 'My EUR', currency_code: 'EUR' }),
]

function setup(props: Partial<React.ComponentProps<typeof CreateOptionOfferDialog>> = {}) {
  const onSubmit = jest.fn()
  const onOpenChange = jest.fn()
  render(
    <CreateOptionOfferDialog
      open
      onOpenChange={onOpenChange}
      holdings={holdings}
      accounts={accounts}
      onSubmit={onSubmit}
      loading={false}
      {...props}
    />
  )
  return { onSubmit, onOpenChange }
}

describe('CreateOptionOfferDialog', () => {
  it('renders Stock ticker label (not Stock ID)', () => {
    setup()
    expect(screen.getByText(/stock ticker/i)).toBeInTheDocument()
    expect(screen.queryByText(/^stock id$/i)).not.toBeInTheDocument()
  })

  it('shows tickers from stock holdings as options', () => {
    setup()
    expect(screen.getByRole('option', { name: /AAPL — Apple/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /TSLA — Tesla/ })).toBeInTheDocument()
  })

  it('omits non-stock holdings (options, futures) from the dropdown', () => {
    setup()
    expect(screen.queryByRole('option', { name: /AAPL-OPT/ })).not.toBeInTheDocument()
  })

  it('shows an Account label', () => {
    setup()
    expect(screen.getByText(/^account$/i)).toBeInTheDocument()
  })

  it('submits payload with ticker + account_id (no stock_id)', () => {
    const { onSubmit } = setup()
    fireEvent.click(screen.getByRole('option', { name: /AAPL — Apple/ }))
    fireEvent.click(screen.getByRole('option', { name: /My RSD/ }))
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/strike/i), { target: { value: '5000.00' } })
    fireEvent.change(screen.getByLabelText(/settlement/i), { target: { value: '2026-06-05' } })
    fireEvent.click(screen.getByRole('button', { name: /create offer/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'sell_initiated',
        ticker: 'AAPL',
        quantity: '100',
        strike_price: '5000.00',
        settlement_date: '2026-06-05',
        account_id: 4242,
      })
    )
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('stock_id')
  })

  it('keeps the Create button disabled until ticker and account are chosen', () => {
    setup()
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/strike/i), { target: { value: '5000.00' } })
    fireEvent.change(screen.getByLabelText(/settlement/i), { target: { value: '2026-06-05' } })
    expect(screen.getByRole('button', { name: /create offer/i })).toBeDisabled()
  })
})
