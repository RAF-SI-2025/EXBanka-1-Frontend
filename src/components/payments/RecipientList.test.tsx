import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecipientList } from './RecipientList'
import { createMockPaymentRecipient } from '@/__tests__/fixtures/payment-fixtures'

describe('RecipientList', () => {
  const recipients = [
    createMockPaymentRecipient({
      id: 1,
      recipient_name: 'Elektro Beograd',
      account_number: '111000100000000099',
    }),
    createMockPaymentRecipient({
      id: 2,
      recipient_name: 'Vodovod',
      account_number: '111000100000000088',
    }),
  ]

  it('renders recipient rows', () => {
    render(<RecipientList recipients={recipients} onEdit={jest.fn()} onDelete={jest.fn()} />)
    expect(screen.getByText('Elektro Beograd')).toBeInTheDocument()
    expect(screen.getByText('Vodovod')).toBeInTheDocument()
  })

  it('renders account numbers', () => {
    render(<RecipientList recipients={recipients} onEdit={jest.fn()} onDelete={jest.fn()} />)
    expect(screen.getByText('111000100000000099')).toBeInTheDocument()
    expect(screen.getByText('111000100000000088')).toBeInTheDocument()
  })

  it('calls onEdit with the recipient when edit button clicked', async () => {
    const user = userEvent.setup()
    const onEdit = jest.fn()
    render(<RecipientList recipients={recipients} onEdit={onEdit} onDelete={jest.fn()} />)

    const editButtons = screen.getAllByRole('button', { name: /izmeni/i })
    await user.click(editButtons[0])
    expect(onEdit).toHaveBeenCalledWith(recipients[0])
  })

  it('calls onDelete with recipient id when delete button clicked', async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()
    render(<RecipientList recipients={recipients} onEdit={jest.fn()} onDelete={onDelete} />)

    const deleteButtons = screen.getAllByRole('button', { name: /obriši/i })
    await user.click(deleteButtons[1])
    expect(onDelete).toHaveBeenCalledWith(2)
  })

  it('shows empty state when no recipients', () => {
    render(<RecipientList recipients={[]} onEdit={jest.fn()} onDelete={jest.fn()} />)
    expect(screen.getByText(/nema sačuvanih primalaca/i)).toBeInTheDocument()
  })
})
