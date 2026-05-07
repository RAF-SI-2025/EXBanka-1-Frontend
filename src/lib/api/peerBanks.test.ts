import { apiClient } from '@/lib/api/axios'
import {
  getPeerBanks,
  getPeerBank,
  createPeerBank,
  updatePeerBank,
  deletePeerBank,
} from '@/lib/api/peerBanks'
import type { PeerBank, CreatePeerBankPayload, UpdatePeerBankPayload } from '@/types/peerBank'

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockPut = jest.mocked(apiClient.put)
const mockDelete = jest.mocked(apiClient.delete)

const samplePeer: PeerBank = {
  id: 1,
  bank_code: '222',
  routing_number: 222,
  base_url: 'http://peer-222/api/v3',
  api_token_preview: '…-222',
  hmac_enabled: false,
  active: true,
  created_at: 1714345200,
  updated_at: 1714345200,
}

beforeEach(() => jest.clearAllMocks())

describe('getPeerBanks', () => {
  it('GETs /peer-banks and returns the list', async () => {
    mockGet.mockResolvedValue({ data: { peer_banks: [samplePeer] } })

    const result = await getPeerBanks()

    expect(mockGet).toHaveBeenCalledWith('/peer-banks', { params: undefined })
    expect(result.peer_banks).toEqual([samplePeer])
  })

  it('passes active_only query param when provided', async () => {
    mockGet.mockResolvedValue({ data: { peer_banks: [] } })

    await getPeerBanks({ active_only: true })

    expect(mockGet).toHaveBeenCalledWith('/peer-banks', { params: { active_only: true } })
  })

  it('coerces a missing peer_banks array to []', async () => {
    mockGet.mockResolvedValue({ data: {} })

    const result = await getPeerBanks()

    expect(result.peer_banks).toEqual([])
  })
})

describe('getPeerBank', () => {
  it('GETs /peer-banks/:id', async () => {
    mockGet.mockResolvedValue({ data: samplePeer })

    const result = await getPeerBank(1)

    expect(mockGet).toHaveBeenCalledWith('/peer-banks/1')
    expect(result).toEqual(samplePeer)
  })
})

describe('createPeerBank', () => {
  it('POSTs the payload to /peer-banks', async () => {
    const payload: CreatePeerBankPayload = {
      bank_code: '222',
      routing_number: 222,
      base_url: 'http://peer-222/api/v3',
      api_token: 'secret',
      active: true,
    }
    mockPost.mockResolvedValue({ data: samplePeer })

    const result = await createPeerBank(payload)

    expect(mockPost).toHaveBeenCalledWith('/peer-banks', payload)
    expect(result).toEqual(samplePeer)
  })
})

describe('updatePeerBank', () => {
  it('PUTs the payload to /peer-banks/:id', async () => {
    const payload: UpdatePeerBankPayload = { base_url: 'http://new/api/v3' }
    mockPut.mockResolvedValue({ data: samplePeer })

    await updatePeerBank(1, payload)

    expect(mockPut).toHaveBeenCalledWith('/peer-banks/1', payload)
  })
})

describe('deletePeerBank', () => {
  it('DELETEs /peer-banks/:id', async () => {
    mockDelete.mockResolvedValue({ data: undefined })

    await deletePeerBank(7)

    expect(mockDelete).toHaveBeenCalledWith('/peer-banks/7')
  })
})
