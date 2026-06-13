import { render, screen, fireEvent } from '@testing-library/react'
import { ExerciseContractDialog } from '@/views/otcContracts/components/ExerciseContractDialog'
import { createMockOptionContract } from '@/__tests__/fixtures/otcOption-fixtures'
import type { Account } from '@/types/account'

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    account_number: '111000000000000001',
    account_name: 'Main',
    currency_code: 'USD',
    account_kind: 'current',
    account_type: 'standard',
    account_category: 'personal',
    balance: 1000,
    available_balance: 1000,
    reserved_balance: 0,
    status: 'ACTIVE',
    owner_id: 7,
    ...overrides,
  }
}

describe('ExerciseContractDialog', () => {
  const contract = createMockOptionContract()
  const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    contract,
    onSubmit: jest.fn(),
    loading: false,
  }

  beforeEach(() => jest.clearAllMocks())

  describe('local contract', () => {
    it('does not render a buyer account selector (accounts are read from contract)', () => {
      render(<ExerciseContractDialog {...baseProps} />)
      expect(screen.queryByLabelText(/buyer account/i)).not.toBeInTheDocument()
    })

    it('submits an empty body when Exercise is clicked', () => {
      const onSubmit = jest.fn()
      render(<ExerciseContractDialog {...baseProps} onSubmit={onSubmit} />)
      fireEvent.click(screen.getByRole('button', { name: /^exercise$/i }))
      expect(onSubmit).toHaveBeenCalledWith({})
    })

    it('shows the total cost', () => {
      render(<ExerciseContractDialog {...baseProps} />)
      expect(screen.getByText(/500000\.00/)).toBeInTheDocument()
    })
  })

  describe('remote (cross-bank) contract', () => {
    const remote = createMockOptionContract({ kind: 'remote', strike_currency: 'USD' })

    it('renders a buyer account selector', () => {
      render(<ExerciseContractDialog {...baseProps} contract={remote} accounts={[account()]} />)
      expect(screen.getByLabelText(/buyer account/i)).toBeInTheDocument()
    })

    it('disables Exercise until a buyer account is chosen', () => {
      render(<ExerciseContractDialog {...baseProps} contract={remote} accounts={[account()]} />)
      expect(screen.getByRole('button', { name: /^exercise$/i })).toBeDisabled()
    })

    it('only offers accounts matching the strike currency', () => {
      render(
        <ExerciseContractDialog
          {...baseProps}
          contract={remote}
          accounts={[
            account({ id: 1, account_number: 'USD-ACC', currency_code: 'USD' }),
            account({ id: 2, account_number: 'EUR-ACC', currency_code: 'EUR' }),
          ]}
        />
      )
      expect(screen.getByRole('option', { name: /USD-ACC/ })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /EUR-ACC/ })).not.toBeInTheDocument()
    })

    it('submits buyer_account_number for the selected account', () => {
      const onSubmit = jest.fn()
      render(
        <ExerciseContractDialog
          {...baseProps}
          contract={remote}
          accounts={[account({ account_number: '111000000000000001' })]}
          onSubmit={onSubmit}
        />
      )
      fireEvent.change(screen.getByLabelText(/buyer account/i), {
        target: { value: '111000000000000001' },
      })
      fireEvent.click(screen.getByRole('button', { name: /^exercise$/i }))
      expect(onSubmit).toHaveBeenCalledWith({ buyer_account_number: '111000000000000001' })
    })
  })
})
