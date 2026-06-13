import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications'
import * as notificationsApi from '@/lib/api/notifications'
import { mockNotifications } from '@/__tests__/fixtures/notification-fixtures'

jest.mock('@/lib/api/notifications')

beforeEach(() => jest.clearAllMocks())

describe('useNotifications', () => {
  it('fetches the list with filters', async () => {
    jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
      notifications: mockNotifications,
      total: mockNotifications.length,
    })

    const { result } = renderHook(() => useNotifications({ page: 1, page_size: 20 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(notificationsApi.getNotifications).toHaveBeenCalledWith({ page: 1, page_size: 20 })
    expect(result.current.data?.notifications).toHaveLength(3)
  })
})

describe('useUnreadNotificationCount', () => {
  it('fetches the unread count', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 7 })

    const { result } = renderHook(() => useUnreadNotificationCount(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.unread_count).toBe(7)
  })
})

describe('useMarkNotificationRead', () => {
  it('calls API with the id', async () => {
    jest.mocked(notificationsApi.markNotificationRead).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(42)
    })

    expect(notificationsApi.markNotificationRead).toHaveBeenCalledWith(42)
  })
})

describe('useMarkAllNotificationsRead', () => {
  it('calls API once', async () => {
    jest
      .mocked(notificationsApi.markAllNotificationsRead)
      .mockResolvedValue({ success: true, count: 5 })

    const { result } = renderHook(() => useMarkAllNotificationsRead(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(notificationsApi.markAllNotificationsRead).toHaveBeenCalledTimes(1)
  })
})
