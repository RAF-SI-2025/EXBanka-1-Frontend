import { screen, fireEvent, waitFor } from '@testing-library/react'
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
    expect(screen.getByText(/client management/i)).toBeInTheDocument()
    expect(screen.getByText('Petar')).toBeInTheDocument()
    expect(screen.getByText('Petrović')).toBeInTheDocument()
  })

  it('calls hook with page 1 and page_size 10 on initial load', () => {
    renderWithProviders(<AdminClientsPage />)
    expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 })
    )
  })

  it('shows pagination controls', () => {
    renderWithProviders(<AdminClientsPage />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument()
  })

  it('shows page 1 of 2 when total > PAGE_SIZE', () => {
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: {
        clients: Array.from({ length: 10 }, (_, i) => createMockClient({ id: i + 1 })),
        total: 11,
      },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminClientsPage />)
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('calls hook with page 2 when next arrow is clicked', async () => {
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: {
        clients: Array.from({ length: 10 }, (_, i) => createMockClient({ id: i + 1 })),
        total: 11,
      },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminClientsPage />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 })
      )
    )
  })

  it('resets to page 1 when filter changes', async () => {
    jest.mocked(useClientsHook.useAllClients).mockReturnValue({
      data: {
        clients: Array.from({ length: 10 }, (_, i) => createMockClient({ id: i + 1 })),
        total: 11,
      },
      isLoading: false,
    } as any)
    renderWithProviders(<AdminClientsPage />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() =>
      expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    )

    const nameInput = screen.getByPlaceholderText(/^name$/i)
    fireEvent.change(nameInput, { target: { value: 'Ana' } })

    await waitFor(() =>
      expect(useClientsHook.useAllClients).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, name: 'Ana' })
      )
    )
  })
})
