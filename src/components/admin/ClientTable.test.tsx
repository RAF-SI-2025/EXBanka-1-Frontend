import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ClientTable } from '@/components/admin/ClientTable'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'

describe('ClientTable', () => {
  it('renders client rows with name, email, phone', () => {
    const clients = [createMockClient()]
    renderWithProviders(<ClientTable clients={clients} onEdit={jest.fn()} />)
    expect(screen.getByText('Petar')).toBeInTheDocument()
    expect(screen.getByText('Petrović')).toBeInTheDocument()
    expect(screen.getByText('petar@test.com')).toBeInTheDocument()
    expect(screen.getByText('+38161000001')).toBeInTheDocument()
  })

  it('calls onEdit with correct id when edit button is clicked', async () => {
    const onEdit = jest.fn()
    const client = createMockClient({ id: 42 })
    renderWithProviders(<ClientTable clients={[client]} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(42)
  })
})
