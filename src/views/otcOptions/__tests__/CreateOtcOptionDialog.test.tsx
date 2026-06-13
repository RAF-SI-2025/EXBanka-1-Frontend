import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateOtcOptionDialog } from '@/views/otcOptions/components/CreateOtcOptionDialog'
import type { Account } from '@/types/account'

jest.mock('@/views/otcOptions/hooks/useTickerPickers', () => ({
  useMyStockHoldings: () => ({
    data: { securities: { positions: [{ asset_type: 'stock', symbol: 'AAPL', quantity: 50 }] } },
    isLoading: false,
  }),
  useStockCatalog: () => ({ data: undefined, isLoading: false }),
}))

const account: Account = {
  id: 1,
  account_number: '265000000000123423',
  account_name: 'Main',
  currency_code: 'USD',
  account_kind: 'current',
  account_type: 'standard',
  account_category: 'personal',
  balance: 0,
  available_balance: 0,
  reserved_balance: 0,
  status: 'ACTIVE',
  owner_id: 1,
}

describe('CreateOtcOptionDialog', () => {
  it('shows the full account in the trigger when an account is pre-selected (not the bare id)', () => {
    renderWithProviders(
      <CreateOtcOptionDialog
        open
        onOpenChange={() => {}}
        accounts={[account]}
        submitting={false}
        onSubmit={() => {}}
      />
    )
    expect(screen.getByText('Main · 265-0000000001234-23 (USD)')).toBeInTheDocument()
  })

  it('no longer renders strike price, premium, or settlement-date inputs', () => {
    renderWithProviders(
      <CreateOtcOptionDialog
        open
        onOpenChange={() => {}}
        accounts={[account]}
        submitting={false}
        onSubmit={() => {}}
      />
    )
    expect(screen.queryByLabelText(/strike/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/premium/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/settlement date/i)).not.toBeInTheDocument()
    // Quantity is kept.
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it('submits only direction, ticker, quantity, account_id', async () => {
    const onSubmit = jest.fn()
    renderWithProviders(
      <CreateOtcOptionDialog
        open
        onOpenChange={() => {}}
        accounts={[account]}
        submitting={false}
        onSubmit={onSubmit}
      />
    )

    // Direction defaults to sell_initiated; pick the held ticker.
    await userEvent.click(screen.getByLabelText(/ticker/i))
    await userEvent.click(await screen.findByRole('option', { name: /AAPL/i }))
    await userEvent.type(screen.getByLabelText(/quantity/i), '10')
    await userEvent.click(screen.getByRole('button', { name: /post listing/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      direction: 'sell_initiated',
      ticker: 'AAPL',
      quantity: '10',
      account_id: 1,
    })
  })
})
