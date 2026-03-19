import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { RenameAccountDialog } from '@/components/accounts/RenameAccountDialog'

describe('RenameAccountDialog', () => {
  it('renders dialog with input', () => {
    renderWithProviders(
      <RenameAccountDialog
        open={true}
        onOpenChange={jest.fn()}
        currentName="Tekući RSD"
        onRename={jest.fn()}
        loading={false}
      />
    )
    expect(screen.getByLabelText(/naziv računa/i)).toBeInTheDocument()
    expect(screen.getByText(/preimenuj račun/i)).toBeInTheDocument()
  })

  it('shows error when new name is the same as current', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <RenameAccountDialog
        open={true}
        onOpenChange={jest.fn()}
        currentName="Tekući RSD"
        onRename={jest.fn()}
        loading={false}
      />
    )
    const input = screen.getByLabelText(/naziv računa/i)
    await user.clear(input)
    await user.type(input, 'Tekući RSD')
    expect(screen.getByText(/isti kao trenutni/i)).toBeInTheDocument()
  })

  it('shows error when name matches an existing account', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <RenameAccountDialog
        open={true}
        onOpenChange={jest.fn()}
        currentName="Tekući RSD"
        existingNames={['Devizni EUR']}
        onRename={jest.fn()}
        loading={false}
      />
    )
    const input = screen.getByLabelText(/naziv računa/i)
    await user.clear(input)
    await user.type(input, 'Devizni EUR')
    expect(screen.getByText(/već koristi/i)).toBeInTheDocument()
  })

  it('calls onRename with new name', async () => {
    const user = userEvent.setup()
    const onRename = jest.fn()
    renderWithProviders(
      <RenameAccountDialog
        open={true}
        onOpenChange={jest.fn()}
        currentName="Old Name"
        onRename={onRename}
        loading={false}
      />
    )
    const input = screen.getByLabelText(/naziv računa/i)
    await user.clear(input)
    await user.type(input, 'New Name')
    await user.click(screen.getByText(/sačuvaj/i))
    expect(onRename).toHaveBeenCalledWith('New Name')
  })
})
