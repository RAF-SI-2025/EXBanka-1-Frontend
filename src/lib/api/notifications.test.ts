import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from './notifications'
import { apiClient } from './axios'

jest.mock('./axios')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getNotifications', () => {
  it('GETs /me/notifications with filters and returns the data', async () => {
    const mockData = { notifications: [], total: 0 }
    jest.mocked(apiClient.get).mockResolvedValue({ data: mockData })

    const result = await getNotifications({ page: 2, page_size: 20, read: 'unread' })

    expect(apiClient.get).toHaveBeenCalledWith('/me/notifications', {
      params: { page: 2, page_size: 20, read: 'unread' },
    })
    expect(result).toEqual(mockData)
  })

  it('defaults notifications array to empty when backend returns null', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: { notifications: null, total: 0 } })
    const result = await getNotifications()
    expect(result.notifications).toEqual([])
  })
})

describe('getUnreadCount', () => {
  it('GETs /me/notifications/unread-count and returns the data', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: { unread_count: 3 } })
    const result = await getUnreadCount()
    expect(apiClient.get).toHaveBeenCalledWith('/me/notifications/unread-count')
    expect(result).toEqual({ unread_count: 3 })
  })
})

describe('markNotificationRead', () => {
  it('POSTs /me/notifications/:id/read', async () => {
    jest.mocked(apiClient.post).mockResolvedValue({ data: { success: true } })
    const result = await markNotificationRead(42)
    expect(apiClient.post).toHaveBeenCalledWith('/me/notifications/42/read')
    expect(result).toEqual({ success: true })
  })
})

describe('markAllNotificationsRead', () => {
  it('POSTs /me/notifications/read-all', async () => {
    jest.mocked(apiClient.post).mockResolvedValue({ data: { success: true, count: 5 } })
    const result = await markAllNotificationsRead()
    expect(apiClient.post).toHaveBeenCalledWith('/me/notifications/read-all')
    expect(result).toEqual({ success: true, count: 5 })
  })
})
