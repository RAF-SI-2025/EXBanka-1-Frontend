import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminClientsPage } from '@/pages/AdminClientsPage'
import * as useClientsHook from '@/hooks/useClients'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'

jest.mock('@/hooks/useClients')

describe('AdminClientsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: { clients: [createMockClient()], total: 1 },
      isLoading: false,
    } as any)
  })

  it('renders clients management page', () => {
    renderWithProviders(<AdminClientsPage />)
    expect(screen.getByText(/upravljanje klijentima/i)).toBeInTheDocument()
    expect(screen.getByText('Petar')).toBeInTheDocument()
    expect(screen.getByText('Petrović')).toBeInTheDocument()
  })
})
