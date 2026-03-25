import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecipientForm } from './RecipientForm'

const noop = () => {}

describe('RecipientForm', () => {
  it('renders name and account number inputs', () => {
    render(<RecipientForm onSubmit={noop} submitting={false} />)
    expect(screen.getByLabelText(/recipient name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/account number/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<RecipientForm onSubmit={noop} submitting={false} />)
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
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
    expect(screen.getByLabelText(/recipient name/i)).toHaveValue('Elektro Beograd')
    expect(screen.getByLabelText(/account number/i)).toHaveValue('111000100000000099')
  })

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<RecipientForm onSubmit={onSubmit} submitting={false} />)

    await user.type(screen.getByLabelText(/recipient name/i), 'Test Primalac')
    await user.type(screen.getByLabelText(/account number/i), '111000100000000099')
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient_name: 'Test Primalac',
        account_number: '111000100000000099',
      }),
      expect.anything()
    )
  })

  it('renders Cancel button when onCancel is provided', () => {
    render(<RecipientForm onSubmit={noop} onCancel={noop} submitting={false} />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = jest.fn()
    render(<RecipientForm onSubmit={noop} onCancel={onCancel} submitting={false} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows "Save" label when in edit mode', () => {
    render(<RecipientForm onSubmit={noop} submitting={false} isEditing />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('shows "Add" label when not in edit mode', () => {
    render(<RecipientForm onSubmit={noop} submitting={false} />)
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })
})
