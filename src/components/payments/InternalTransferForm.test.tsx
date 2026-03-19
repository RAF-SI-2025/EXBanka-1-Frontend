import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { InternalTransferForm } from '@/components/payments/InternalTransferForm'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

const mockAccounts = [
  createMockAccount({ account_number: '111000100000000011', name: 'Tekući RSD', currency: 'RSD' }),
  createMockAccount({
    id: 2,
    account_number: '111000100000000022',
    name: 'Štedni RSD',
    currency: 'RSD',
  }),
]
const onSubmit = jest.fn()

describe('InternalTransferForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders from account selector', () => {
    renderWithProviders(<InternalTransferForm accounts={mockAccounts} onSubmit={onSubmit} />)
    expect(screen.getByText('Sa računa')).toBeInTheDocument()
  })

  it('renders to account selector', () => {
    renderWithProviders(<InternalTransferForm accounts={mockAccounts} onSubmit={onSubmit} />)
    expect(screen.getByText('Na račun')).toBeInTheDocument()
  })

  it('renders amount input', () => {
    renderWithProviders(<InternalTransferForm accounts={mockAccounts} onSubmit={onSubmit} />)
    expect(screen.getByLabelText(/iznos/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<InternalTransferForm accounts={mockAccounts} onSubmit={onSubmit} />)
    expect(screen.getByRole('button', { name: /nastavi/i })).toBeInTheDocument()
  })
})
