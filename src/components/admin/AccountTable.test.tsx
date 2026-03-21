import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AccountTable } from '@/components/admin/AccountTable'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

const mockClient = {
  id: 1,
  first_name: 'Ana',
  last_name: 'Anić',
  email: 'ana@test.com',
  date_of_birth: 0,
}

describe('AccountTable', () => {
  it('renders account rows', () => {
    const accounts = [createMockAccount()]
    renderWithProviders(<AccountTable accounts={accounts} onViewCards={jest.fn()} />)
    expect(screen.getByText(accounts[0].owner_name!)).toBeInTheDocument()
  })

  it('calls onViewCards when button clicked', async () => {
    const onViewCards = jest.fn()
    renderWithProviders(<AccountTable accounts={[createMockAccount()]} onViewCards={onViewCards} />)
    await userEvent.click(screen.getByRole('button', { name: /kartice/i }))
    expect(onViewCards).toHaveBeenCalledWith(1)
  })

  it('shows client first and last name for personal accounts when clientsById provided', () => {
    const account = createMockAccount({ account_category: 'personal', owner_id: 1 })
    const clientsById = { 1: mockClient }
    renderWithProviders(
      <AccountTable accounts={[account]} onViewCards={jest.fn()} clientsById={clientsById} />
    )
    expect(screen.getByText('Ana Anić')).toBeInTheDocument()
  })

  it('falls back to owner_name for personal accounts when client not in clientsById', () => {
    const account = createMockAccount({
      account_category: 'personal',
      owner_id: 99,
      owner_name: 'Fallback Name',
    })
    renderWithProviders(
      <AccountTable accounts={[account]} onViewCards={jest.fn()} clientsById={{}} />
    )
    expect(screen.getByText('Fallback Name')).toBeInTheDocument()
  })

  it('shows owner_name for company accounts even when clientsById provided', () => {
    const account = createMockAccount({
      account_category: 'business',
      owner_id: 1,
      owner_name: 'Firma d.o.o.',
    })
    const clientsById = { 1: mockClient }
    renderWithProviders(
      <AccountTable accounts={[account]} onViewCards={jest.fn()} clientsById={clientsById} />
    )
    expect(screen.getByText('Firma d.o.o.')).toBeInTheDocument()
    expect(screen.queryByText('Ana Anić')).not.toBeInTheDocument()
  })
})
