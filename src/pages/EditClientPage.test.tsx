import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EditClientPage } from '@/pages/EditClientPage'
import * as useClientsHook from '@/hooks/useClients'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'

jest.mock('@/hooks/useClients')

describe('EditClientPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useClientsHook.useClient).mockReturnValue({
      data: createMockClient(),
      isLoading: false,
    } as any)
    jest.mocked(useClientsHook.useUpdateClient).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
    } as any)
  })

  it('renders edit client form', () => {
    renderWithProviders(<EditClientPage />, { route: '/admin/clients/1/edit' })
    expect(screen.getByText(/izmeni klijenta/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Ime')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
