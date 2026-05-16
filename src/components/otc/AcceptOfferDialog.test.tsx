import { render, screen, fireEvent } from '@testing-library/react'
import { AcceptOfferDialog } from '@/components/otc/AcceptOfferDialog'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

const accounts = [
  createMockAccount({ id: 5, account_name: 'Main', currency_code: 'RSD' }),
  createMockAccount({ id: 9, account_name: 'EUR Wallet', currency_code: 'EUR' }),
]

describe('AcceptOfferDialog', () => {
  it('renders a single account selector (no buyer/seller fields)', () => {
    render(
      <AcceptOfferDialog
        open
        onOpenChange={jest.fn()}
        accounts={accounts}
        onSubmit={jest.fn()}
        loading={false}
      />
    )
    expect(screen.getByText(/your account/i)).toBeInTheDocument()
    expect(screen.queryByText(/buyer account/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/seller account/i)).not.toBeInTheDocument()
  })

  it('submits payload with only account_id (no buyer/seller fields)', () => {
    const onSubmit = jest.fn()
    render(
      <AcceptOfferDialog
        open
        onOpenChange={jest.fn()}
        accounts={accounts}
        onSubmit={onSubmit}
        loading={false}
      />
    )
    fireEvent.click(screen.getByRole('option', { name: /Main/ }))
    fireEvent.click(screen.getByRole('button', { name: /^accept$/i }))
    expect(onSubmit).toHaveBeenCalledWith({ acceptor_account_id: 5 })
  })

  it('keeps Accept disabled until an account is chosen', () => {
    render(
      <AcceptOfferDialog
        open
        onOpenChange={jest.fn()}
        accounts={accounts}
        onSubmit={jest.fn()}
        loading={false}
      />
    )
    expect(screen.getByRole('button', { name: /^accept$/i })).toBeDisabled()
  })
})
