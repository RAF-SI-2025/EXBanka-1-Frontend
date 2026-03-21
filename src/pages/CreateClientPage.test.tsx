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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/novi klijent/i)
    expect(screen.getByLabelText('Ime')).toBeInTheDocument()
    expect(screen.getByLabelText('Prezime')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('button', { name: /nazad/i })).toBeInTheDocument()
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

    await userEvent.type(screen.getByLabelText('Ime'), 'Marko')
    await userEvent.type(screen.getByLabelText('Prezime'), 'Petrović')
    await userEvent.type(screen.getByLabelText('Email'), 'marko@test.com')
    fireEvent.change(screen.getByLabelText(/datum ro/i), { target: { value: '1990-01-01' } })
    await userEvent.type(screen.getByLabelText('JMBG'), '1234567890123')

    await userEvent.click(screen.getByRole('button', { name: /kreiraj klijenta/i }))

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
  })

  it('shows error message when creation fails', () => {
    jest.mocked(useClientsHook.useCreateClient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      isSuccess: false,
    } as any)

    renderWithProviders(<CreateClientPage />)
    expect(screen.getByText(/greška pri kreiranju/i)).toBeInTheDocument()
  })

  it('disables submit button while pending', () => {
    jest.mocked(useClientsHook.useCreateClient).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      isError: false,
      isSuccess: false,
    } as any)

    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('button', { name: /kreiranje/i })).toBeDisabled()
  })
})
