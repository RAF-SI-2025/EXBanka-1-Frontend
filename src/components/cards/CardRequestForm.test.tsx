import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardRequestForm } from '@/components/cards/CardRequestForm'

const mockAccounts = [
  { id: 1, account_number: '111000100000000011', name: 'Main RSD', currency: 'RSD' },
]

describe('CardRequestForm', () => {
  const onSubmit = jest.fn()

  it('renders account selector', () => {
    renderWithProviders(
      <CardRequestForm accounts={mockAccounts as any} onSubmit={onSubmit} loading={false} />
    )
    expect(screen.getByLabelText(/račun/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zatraži/i })).toBeInTheDocument()
  })
})
