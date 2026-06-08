import { apiClient } from '@/lib/api/axios'
import {
  addToWatchlistItems,
  createWatchlist,
  deleteWatchlist,
  getWatchlistItems,
  getWatchlists,
  removeFromWatchlistItems,
} from '@/lib/api/watchlist'

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

const sampleList = { id: 5, name: 'tech', item_count: 2, created_at: 1731699200 }

describe('getWatchlists', () => {
  it('GET /me/watchlists and returns the watchlists array', async () => {
    mockGet.mockResolvedValue({ data: { watchlists: [sampleList] } })
    const result = await getWatchlists()
    expect(mockGet).toHaveBeenCalledWith('/me/watchlists')
    expect(result).toEqual([sampleList])
  })

  it('defaults to [] when backend returns null', async () => {
    mockGet.mockResolvedValue({ data: { watchlists: null } })
    expect(await getWatchlists()).toEqual([])
  })

  it('accepts a bare array response', async () => {
    mockGet.mockResolvedValue({ data: [sampleList] })
    expect(await getWatchlists()).toEqual([sampleList])
  })
})

describe('createWatchlist', () => {
  it('POST /me/watchlists with the name and returns the list', async () => {
    mockPost.mockResolvedValue({ data: { watchlist: sampleList } })
    const result = await createWatchlist('tech')
    expect(mockPost).toHaveBeenCalledWith('/me/watchlists', { name: 'tech' })
    expect(result).toEqual(sampleList)
  })
})

describe('deleteWatchlist', () => {
  it('DELETE /me/watchlists/:id', async () => {
    mockDelete.mockResolvedValue({ data: undefined })
    await deleteWatchlist(5)
    expect(mockDelete).toHaveBeenCalledWith('/me/watchlists/5')
  })
})

describe('getWatchlistItems', () => {
  it('GET /me/watchlists/:id/items passing filters as query params', async () => {
    mockGet.mockResolvedValue({ data: { items: [sampleItem] } })
    const result = await getWatchlistItems(5, { listing_type: 'stock' })
    expect(mockGet).toHaveBeenCalledWith('/me/watchlists/5/items', {
      params: { listing_type: 'stock' },
    })
    expect(result.items).toHaveLength(1)
  })

  it('defaults items[] to [] when backend returns null', async () => {
    mockGet.mockResolvedValue({ data: { items: null } })
    expect((await getWatchlistItems(5)).items).toEqual([])
  })
})

describe('addToWatchlistItems', () => {
  it('POST /me/watchlists/:id/items with listing_id and returns the item', async () => {
    mockPost.mockResolvedValue({ data: { item: sampleItem } })
    const result = await addToWatchlistItems(5, 42)
    expect(mockPost).toHaveBeenCalledWith('/me/watchlists/5/items', { listing_id: 42 })
    expect(result).toEqual(sampleItem)
  })
})

describe('removeFromWatchlistItems', () => {
  it('DELETE /me/watchlists/:id/items/:listing_id', async () => {
    mockDelete.mockResolvedValue({ data: undefined })
    await removeFromWatchlistItems(5, 42)
    expect(mockDelete).toHaveBeenCalledWith('/me/watchlists/5/items/42')
  })
})
