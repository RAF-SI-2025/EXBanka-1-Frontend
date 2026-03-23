import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { LoanApplicationForm } from '@/components/loans/LoanApplicationForm'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import userEvent from '@testing-library/user-event'

const mockAccounts = [
  createMockAccount({
    account_number: '111000100000000011',
    account_name: 'Tekući RSD',
    currency_code: 'RSD',
  }),
  createMockAccount({
    account_number: '111000100000000022',
    account_name: 'EUR štednja',
    currency_code: 'EUR',
  }),
]

const defaultProps = {
  accounts: mockAccounts,
  onSubmit: jest.fn(),
  submitting: false,
  error: null,
}

describe('LoanApplicationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loan type selector', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByText(/tip kredita/i)).toBeInTheDocument()
  })

  it('renders amount input', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/iznos/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /podnesi zahtev/i })).toBeInTheDocument()
  })

  it('shows loading state when submitting is true', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} submitting={true} />)
    expect(screen.getByRole('button', { name: /podnošenje/i })).toBeDisabled()
  })

  it('shows error message when error is provided', () => {
    const errorMessage = 'Greška pri podnošenju zahteva'
    renderWithProviders(<LoanApplicationForm {...defaultProps} error={errorMessage} />)
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('renders interest type selector', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByText(/tip kamatne stope/i)).toBeInTheDocument()
  })

  it('renders purpose field', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/svrha kredita/i)).toBeInTheDocument()
  })

  it('renders monthly salary field', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/mesečna plata/i)).toBeInTheDocument()
  })

  it('renders employment status selector', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByText(/status zaposlenja/i)).toBeInTheDocument()
  })

  it('renders phone field', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/telefon/i)).toBeInTheDocument()
  })

  it('shows housing period options when housing loan type is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    // Open loan type select
    const loanTypeSelect = screen.getByRole('combobox', { name: /tip kredita/i })
    await user.click(loanTypeSelect)
    const housingOption = screen.getByText('Stambeni')
    await user.click(housingOption)
    // Housing periods include 360 months
    const periodSelect = screen.getByRole('combobox', { name: /period/i })
    await user.click(periodSelect)
    expect(screen.getByText('360 meseci')).toBeInTheDocument()
  })
})
