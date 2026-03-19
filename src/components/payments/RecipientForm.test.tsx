import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecipientForm } from './RecipientForm'

const noop = () => {}

describe('RecipientForm', () => {
  it('renders name and account number inputs', () => {
    render(<RecipientForm onSubmit={noop} submitting={false} />)
    expect(screen.getByLabelText(/ime primaoca/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/broj računa/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<RecipientForm onSubmit={noop} submitting={false} />)
    expect(screen.getByRole('button', { name: /dodaj/i })).toBeInTheDocument()
  })

  it('disables submit button while submitting', () => {
    render(<RecipientForm onSubmit={noop} submitting={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('pre-fills form when defaultValues provided', () => {
    const defaultValues = {
      recipient_name: 'Elektro Beograd',
      account_number: '111000100000000099',
    }
    render(<RecipientForm onSubmit={noop} submitting={false} defaultValues={defaultValues} />)
    expect(screen.getByLabelText(/ime primaoca/i)).toHaveValue('Elektro Beograd')
    expect(screen.getByLabelText(/broj računa/i)).toHaveValue('111000100000000099')
  })

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<RecipientForm onSubmit={onSubmit} submitting={false} />)

    await user.type(screen.getByLabelText(/ime primaoca/i), 'Test Primalac')
    await user.type(screen.getByLabelText(/broj računa/i), '111000100000000099')
    await user.click(screen.getByRole('button', { name: /dodaj/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient_name: 'Test Primalac',
        account_number: '111000100000000099',
      }),
      expect.anything()
    )
  })
})
