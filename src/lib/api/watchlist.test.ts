import { apiClient } from '@/lib/api/axios'
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '@/lib/api/watchlist'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPost = jest.mocked(apiClient.post)
const mockDelete = jest.mocked(apiClient.delete)

beforeEach(() => jest.clearAllMocks())

const sampleItem = {
  id: 1,
  listing_id: 42,
  security_type: 'stock' as const,
  ticker: 'AAPL',
  current_price: '187.45',
  daily_change: '1.25',
  daily_change_percent: '0.67',
  added_at_unix: 1731699200,
}

describe('getWatchlist', () => {
  it('GET /me/watchlist passing filters as query params', async () => {
    mockGet.mockResolvedValue({ data: { items: [sampleItem] } })
    const result = await getWatchlist({ listing_type: 'stock' })
    expect(mockGet).toHaveBeenCalledWith('/me/watchlist', {
      params: { listing_type: 'stock' },
    })
    expect(result.items).toHaveLength(1)
  })

  it('defaults items[] to [] when backend returns null', async () => {
    mockGet.mockResolvedValue({ data: { items: null } })
    const result = await getWatchlist()
    expect(result.items).toEqual([])
  })
})

describe('addToWatchlist', () => {
  it('POST /me/watchlist with listing_id and returns the item', async () => {
    mockPost.mockResolvedValue({ data: { item: sampleItem } })
    const result = await addToWatchlist(42)
    expect(mockPost).toHaveBeenCalledWith('/me/watchlist', { listing_id: 42 })
    expect(result).toEqual(sampleItem)
  })
})

describe('removeFromWatchlist', () => {
  it('DELETE /me/watchlist/:listing_id', async () => {
    mockDelete.mockResolvedValue({ data: undefined })
    await removeFromWatchlist(42)
    expect(mockDelete).toHaveBeenCalledWith('/me/watchlist/42')
  })
})
