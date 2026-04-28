import { render, screen, fireEvent } from '@testing-library/react'
import { BuyOnBehalfOtcDialog } from '@/components/otc/BuyOnBehalfOtcDialog'
import { createMockOtcOffer } from '@/__tests__/fixtures/otc-fixtures'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

const offer = createMockOtcOffer({ id: 7, quantity: 10 })
const clients = [createMockClient({ id: 5, first_name: 'Marko', last_name: 'Marković' })]
const accounts = [createMockAccount({ id: 12, account_name: 'Tekući RSD' })]

function setup(overrides: Partial<React.ComponentProps<typeof BuyOnBehalfOtcDialog>> = {}) {
  const onSubmit = jest.fn()
  const onClientSelect = jest.fn()
  const onOpenChange = jest.fn()
  render(
    <BuyOnBehalfOtcDialog
      open
      onOpenChange={onOpenChange}
      offer={offer}
      clients={clients}
      accountsForClient={accounts}
      onClientSelect={onClientSelect}
      onSubmit={onSubmit}
      loading={false}
      {...overrides}
    />
  )
  return { onSubmit, onClientSelect, onOpenChange }
}

describe('BuyOnBehalfOtcDialog', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders header and fields', () => {
    setup()
    expect(screen.getByText(/buy aapl on behalf of client/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it('disables Confirm until client + account are selected', () => {
    setup()
    expect(screen.getByRole('button', { name: /^confirm$/i })).toBeDisabled()
  })

  it('calls onClientSelect when a client is picked', () => {
    const { onClientSelect } = setup()
    fireEvent.click(screen.getByRole('option', { name: /marko marković/i }))
    expect(onClientSelect).toHaveBeenCalledWith(5)
  })

  it('submits client_id, account_id, quantity', () => {
    const { onSubmit } = setup()
    fireEvent.click(screen.getByRole('option', { name: /marko marković/i }))
    fireEvent.click(screen.getByRole('option', { name: /tekući rsd/i }))
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }))
    expect(onSubmit).toHaveBeenCalledWith({ client_id: 5, account_id: 12, quantity: 3 })
  })

  it('disables Confirm while loading', () => {
    setup({ loading: true })
    expect(screen.getByRole('button', { name: /buying/i })).toBeDisabled()
  })
})
