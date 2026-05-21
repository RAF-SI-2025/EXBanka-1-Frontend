import { render, screen, fireEvent } from '@testing-library/react'
import { InvestInFundDialog } from '@/views/funds/components/InvestInFundDialog'
import { createMockFund } from '@/__tests__/fixtures/fund-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

const fund = createMockFund({ minimum_contribution_rsd: '1000.00' })
const accounts = [createMockAccount({ id: 5, currency_code: 'RSD' })]

function setup(overrides: Partial<React.ComponentProps<typeof InvestInFundDialog>> = {}) {
  const onSubmit = jest.fn()
  render(
    <InvestInFundDialog
      open
      onOpenChange={() => {}}
      fund={fund}
      accounts={accounts}
      onSubmit={onSubmit}
      loading={false}
      {...overrides}
    />
  )
  return { onSubmit }
}

describe('InvestInFundDialog', () => {
  it('disables Invest until account + valid amount are picked', () => {
    setup()
    expect(screen.getByRole('button', { name: /^invest$/i })).toBeDisabled()
  })

  it('rejects amounts below minimum_contribution_rsd in RSD', () => {
    setup()
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '500' } })
    expect(screen.getByText(/minimum contribution/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^invest$/i })).toBeDisabled()
  })

  it('submits {source_account_id, amount, currency} for a client', () => {
    const { onSubmit } = setup()
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '5000.00' } })
    fireEvent.click(screen.getByRole('button', { name: /^invest$/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      source_account_id: 5,
      amount: '5000.00',
      currency: 'RSD',
    })
  })

  it('adds on_behalf_of_type=bank when asBank prop is set', () => {
    const { onSubmit } = setup({ asBank: true })
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '5000.00' } })
    fireEvent.click(screen.getByRole('button', { name: /^invest$/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      source_account_id: 5,
      amount: '5000.00',
      currency: 'RSD',
      on_behalf_of_type: 'bank',
    })
  })

  it('shows account number and name in the source account trigger after selection', () => {
    setup()
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('111000100000000011 — Tekući RSD (RSD)')
    expect(trigger).toHaveClass('w-full')
    const truncateSpan = trigger.querySelector('[data-testid="select-value"] span')
    expect(truncateSpan).toHaveClass('truncate')
  })

  it('shows validation error when RSD amount is below 100', () => {
    const accounts = [createMockAccount({ currency_code: 'RSD', available_balance: 5000 })]
    const fundWith0Min = { ...createMockFund(), minimum_contribution_rsd: '0' }
    setup({ fund: fundWith0Min, accounts })
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } })
    expect(screen.getByText(/minimum contribution/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^invest$/i })).toBeDisabled()
  })

  it('shows error and disables Invest when amount exceeds available balance', () => {
    const accounts = [createMockAccount({ id: 5, currency_code: 'RSD', available_balance: 500 })]
    setup({ accounts })
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '9999' } })
    expect(screen.getByText(/insufficient.*balance/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^invest$/i })).toBeDisabled()
  })
})
