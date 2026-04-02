import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EditClientForm } from '@/components/admin/EditClientForm'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'

describe('EditClientForm', () => {
  it('renders form pre-filled with client data', () => {
    const client = createMockClient()
    renderWithProviders(<EditClientForm client={client} onSubmit={jest.fn()} submitting={false} />)
    expect(screen.getByDisplayValue('Petar')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Petrović')).toBeInTheDocument()
    expect(screen.getByDisplayValue('petar@test.com')).toBeInTheDocument()
  })

  it('calls onSubmit with changed data when submitted', async () => {
    const onSubmit = jest.fn()
    const client = createMockClient()
    renderWithProviders(<EditClientForm client={client} onSubmit={onSubmit} submitting={false} />)
    const firstNameInput = screen.getByDisplayValue('Petar')
    await userEvent.clear(firstNameInput)
    await userEvent.type(firstNameInput, 'Nikola')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ first_name: 'Nikola' }),
      expect.anything()
    )
  })

  it('shows loading state when submitting=true', () => {
    const client = createMockClient()
    renderWithProviders(<EditClientForm client={client} onSubmit={jest.fn()} submitting={true} />)
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })
})
