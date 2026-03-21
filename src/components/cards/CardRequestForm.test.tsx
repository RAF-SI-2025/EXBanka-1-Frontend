import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardRequestForm } from '@/components/cards/CardRequestForm'

const mockAccounts = [
  {
    id: 1,
    account_number: '111000100000000011',
    account_name: 'Main RSD',
    currency_code: 'RSD',
    account_category: 'personal',
  },
]

describe('CardRequestForm', () => {
  const onSubmit = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders account selector', () => {
    renderWithProviders(
      <CardRequestForm accounts={mockAccounts as any} onSubmit={onSubmit} loading={false} />
    )
    expect(screen.getByLabelText(/račun/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zatraži/i })).toBeInTheDocument()
  })

  it('renders card brand dropdown', () => {
    renderWithProviders(
      <CardRequestForm accounts={mockAccounts as any} onSubmit={onSubmit} loading={false} />
    )
    expect(screen.getByLabelText(/tip kartice/i)).toBeInTheDocument()
  })

  it('calls onSubmit with account number and card brand', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CardRequestForm accounts={mockAccounts as any} onSubmit={onSubmit} loading={false} />
    )
    await user.click(screen.getByLabelText(/račun/i))
    await user.click(screen.getByText(/111000100000000011/i))
    await user.click(screen.getByLabelText(/tip kartice/i))
    await user.click(screen.getByText(/visa/i))
    await user.click(screen.getByRole('button', { name: /zatraži/i }))
    expect(onSubmit).toHaveBeenCalledWith('111000100000000011', 'VISA')
  })
})
