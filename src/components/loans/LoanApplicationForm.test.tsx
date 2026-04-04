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
    expect(screen.getByText(/loan type/i)).toBeInTheDocument()
  })

  it('renders amount input', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument()
  })

  it('shows loading state when submitting is true', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} submitting={true} />)
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
  })

  it('shows error message when error is provided', () => {
    const errorMessage = 'Greška pri podnošenju zahteva'
    renderWithProviders(<LoanApplicationForm {...defaultProps} error={errorMessage} />)
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('renders interest type selector', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByText(/interest rate type/i)).toBeInTheDocument()
  })

  it('renders purpose field', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/loan purpose/i)).toBeInTheDocument()
  })

  it('renders monthly salary field', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/monthly salary/i)).toBeInTheDocument()
  })

  it('renders employment status selector', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByText(/employment status/i)).toBeInTheDocument()
  })

  it('renders phone field', () => {
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
  })

  it('shows housing period options when housing loan type is selected', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<LoanApplicationForm {...defaultProps} />)
    // Open loan type select
    const loanTypeSelect = screen.getByRole('combobox', { name: /loan type/i })
    await user.click(loanTypeSelect)
    const housingOption = screen.getByText('Housing')
    await user.click(housingOption)
    // Housing periods include 360 months
    const periodSelect = screen.getByRole('combobox', { name: /period/i })
    await user.click(periodSelect)
    expect(screen.getByText('360 months')).toBeInTheDocument()
  }, 15000)
})
