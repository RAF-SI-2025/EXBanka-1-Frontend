import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PeerBanksView } from '@/views/peerBanks/PeerBanksView'
import { peerBanksApi } from '@/views/peerBanks/api/peerBanksApi'
import type { PeerBank } from '@/views/peerBanks/types'

jest.mock('@/views/peerBanks/api/peerBanksApi', () => ({
  peerBanksApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}))

const mockPeerBanks: PeerBank[] = [
  {
    id: 1,
    bank_code: '222',
    routing_number: 222,
    base_url: 'http://peer-222/api/v3',
    api_token_preview: '…-222',
    hmac_enabled: false,
    active: true,
    created_at: 1714345200,
    updated_at: 1714345200,
  },
  {
    id: 2,
    bank_code: '333',
    routing_number: 333,
    base_url: 'http://peer-333/api/v3',
    api_token_preview: '…-333',
    hmac_enabled: true,
    active: false,
    created_at: 1714345200,
    updated_at: 1714345200,
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(peerBanksApi.list).mockResolvedValue({ peer_banks: mockPeerBanks })
  jest.mocked(peerBanksApi.create).mockResolvedValue(mockPeerBanks[0])
  jest.mocked(peerBanksApi.update).mockResolvedValue(mockPeerBanks[0])
  jest.mocked(peerBanksApi.remove).mockResolvedValue(undefined)
})

describe('PeerBanksView', () => {
  it('renders the title, shell, and Add button', async () => {
    renderWithProviders(<PeerBanksView />)
    expect(screen.getByRole('heading', { name: /peer banks/i })).toBeInTheDocument()
    expect(screen.getByTestId('view-shell')).toHaveClass('animate-in')
    await screen.findByText('http://peer-222/api/v3')
    expect(screen.getByRole('button', { name: /add peer bank/i })).toBeInTheDocument()
  })

  it('shows the loading state while data loads', () => {
    jest.mocked(peerBanksApi.list).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<PeerBanksView />)
    expect(screen.getByTestId('view-loading')).toBeInTheDocument()
  })

  it('lists each registered peer bank with its base URL', async () => {
    renderWithProviders(<PeerBanksView />)
    await screen.findByText('http://peer-222/api/v3')
    expect(screen.getByText('http://peer-333/api/v3')).toBeInTheDocument()
    expect(screen.getAllByText('222').length).toBeGreaterThan(0)
    expect(screen.getAllByText('333').length).toBeGreaterThan(0)
  })

  it('opens the Add dialog and POSTs a valid payload', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PeerBanksView />)
    await screen.findByText('http://peer-222/api/v3')

    await user.click(screen.getByRole('button', { name: /add peer bank/i }))

    await user.type(screen.getByLabelText(/bank code/i), '444')
    await user.type(screen.getByLabelText(/routing number/i), '444')
    await user.type(screen.getByLabelText(/base url/i), 'https://peer-444.example.com/api/v3')
    await user.type(screen.getByLabelText(/^api token/i), 'super-secret')

    const submitBtn = screen.getAllByRole('button', { name: /add peer bank/i }).at(-1)!
    await user.click(submitBtn)

    await waitFor(() => {
      expect(peerBanksApi.create).toHaveBeenCalledWith({
        bank_code: '444',
        routing_number: 444,
        base_url: 'https://peer-444.example.com/api/v3',
        api_token: 'super-secret',
        active: true,
      })
    })
  })

  it('rejects an invalid base URL in the Add dialog', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PeerBanksView />)
    await screen.findByText('http://peer-222/api/v3')

    await user.click(screen.getByRole('button', { name: /add peer bank/i }))
    await user.type(screen.getByLabelText(/bank code/i), '444')
    await user.type(screen.getByLabelText(/routing number/i), '444')
    await user.type(screen.getByLabelText(/base url/i), 'not-a-url')
    await user.type(screen.getByLabelText(/^api token/i), 'super-secret')

    const submitBtn = screen.getAllByRole('button', { name: /add peer bank/i }).at(-1)!
    await user.click(submitBtn)

    expect(await screen.findByText(/valid http\(s\) url/i)).toBeInTheDocument()
    expect(peerBanksApi.create).not.toHaveBeenCalled()
  })

  it('toggles a peer bank active flag via the row Disable button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PeerBanksView />)
    await screen.findByText('http://peer-222/api/v3')

    const disableBtn = screen.getByRole('button', { name: /disable/i })
    await user.click(disableBtn)

    await waitFor(() => {
      expect(peerBanksApi.update).toHaveBeenCalledWith(1, { active: false })
    })
  })

  it('removes a peer bank after confirmation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PeerBanksView />)
    await screen.findByText('http://peer-222/api/v3')

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[0])

    const confirm = await screen.findByRole('button', { name: /^remove$/i })
    await user.click(confirm)

    await waitFor(() => {
      expect(peerBanksApi.remove).toHaveBeenCalledWith(1)
    })
  })

  it('opens the Edit dialog and PUTs base_url + active', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PeerBanksView />)
    await screen.findByText('http://peer-222/api/v3')

    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    await user.click(editButtons[0])

    const urlInput = await screen.findByLabelText(/base url/i)
    await user.clear(urlInput)
    await user.type(urlInput, 'https://peer-222-new.example.com/api/v3')

    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(peerBanksApi.update).toHaveBeenCalledWith(1, {
        active: true,
        base_url: 'https://peer-222-new.example.com/api/v3',
      })
    })
  })
})
