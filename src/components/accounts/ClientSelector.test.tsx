import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientSelector } from '@/components/accounts/ClientSelector'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'
import * as clientsApi from '@/lib/api/clients'

jest.mock('@/lib/api/clients')

const mockGetClients = jest.mocked(clientsApi.getClients)

describe('ClientSelector', () => {
  const defaultProps = { onClientSelected: jest.fn() }

  beforeEach(() => jest.clearAllMocks())

  it('renders search input and create new button', () => {
    renderWithProviders(<ClientSelector {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByPlaceholderText(/search client/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create new/i })).toBeInTheDocument()
  })

  it('shows search results when typing', async () => {
    const mockClient = createMockClient()
    mockGetClients.mockResolvedValue({ clients: [mockClient], total_count: 1 })

    renderWithProviders(<ClientSelector {...defaultProps} />, {
      preloadedState: { auth: createMockAuthState() },
    })

    await userEvent.type(screen.getByPlaceholderText(/search client/i), 'Petar')

    await waitFor(() => {
      expect(screen.getByText(/Petar Petrović/)).toBeInTheDocument()
    })
  })
})
