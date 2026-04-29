import { render, screen, fireEvent } from '@testing-library/react'
import { RedeemFromFundDialog } from './RedeemFromFundDialog'
import { createMockClientFundPosition } from '@/__tests__/fixtures/fund-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id?: string
    checked?: boolean
    onCheckedChange?: (v: boolean) => void
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}))

const position = createMockClientFundPosition({
  current_value_rsd: '10000.00',
  fund_name: 'Alpha',
})
const accounts = [createMockAccount({ id: 5, currency_code: 'RSD' })]

function setup(overrides: Partial<React.ComponentProps<typeof RedeemFromFundDialog>> = {}) {
  const onSubmit = jest.fn()
  render(
    <RedeemFromFundDialog
      open
      onOpenChange={() => {}}
      position={position}
      accounts={accounts}
      onSubmit={onSubmit}
      loading={false}
      {...overrides}
    />
  )
  return { onSubmit }
}

describe('RedeemFromFundDialog', () => {
  it('rejects amounts greater than the current position', () => {
    setup()
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: '999999' } })
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    expect(screen.getByText(/cannot redeem more/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^redeem$/i })).toBeDisabled()
  })

  it('fills amount with current_value_rsd when withdraw-all is checked', () => {
    setup()
    fireEvent.click(screen.getByLabelText(/withdraw full position/i))
    expect((screen.getByLabelText(/^amount/i) as HTMLInputElement).value).toBe('10000.00')
  })

  it('submits payload {amount_rsd, target_account_id} for a client', () => {
    const { onSubmit } = setup()
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: '1500.00' } })
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    fireEvent.click(screen.getByRole('button', { name: /^redeem$/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      amount_rsd: '1500.00',
      target_account_id: 5,
    })
  })

  it('adds on_behalf_of_type=bank when asBank is set', () => {
    const { onSubmit } = setup({ asBank: true })
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: '1500.00' } })
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    fireEvent.click(screen.getByRole('button', { name: /^redeem$/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      amount_rsd: '1500.00',
      target_account_id: 5,
      on_behalf_of_type: 'bank',
    })
  })
})
