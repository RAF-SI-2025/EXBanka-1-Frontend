import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateClientPage } from '@/pages/CreateClientPage'
import * as useClientsHook from '@/hooks/useClients'

jest.mock('@/hooks/useClients')

describe('CreateClientPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useClientsHook.useCreateClient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
    } as any)
  })

  it('renders form title and required fields', () => {
    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/new client/i)
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('calls createClient.mutate with form data on submit', async () => {
    const mockMutate = jest.fn()
    jest.mocked(useClientsHook.useCreateClient).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
    } as any)

    renderWithProviders(<CreateClientPage />)

    await userEvent.type(screen.getByLabelText('First Name'), 'Marko')
    await userEvent.type(screen.getByLabelText('Last Name'), 'Petrović')
    await userEvent.type(screen.getByLabelText('Email'), 'marko@test.com')
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } })
    await userEvent.type(screen.getByLabelText('JMBG'), '1234567890123')

    await userEvent.click(screen.getByRole('button', { name: /create client/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Marko',
          last_name: 'Petrović',
          email: 'marko@test.com',
        }),
        expect.any(Object)
      )
    })
  }, 15000)

  it('shows error message when creation fails', () => {
    jest.mocked(useClientsHook.useCreateClient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      isSuccess: false,
    } as any)

    renderWithProviders(<CreateClientPage />)
    expect(screen.getByText(/error creating/i)).toBeInTheDocument()
  })

  it('disables submit button while pending', () => {
    jest.mocked(useClientsHook.useCreateClient).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      isError: false,
      isSuccess: false,
    } as any)

    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })
})
